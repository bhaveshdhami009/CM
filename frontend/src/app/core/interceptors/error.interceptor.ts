import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap, BehaviorSubject, filter, take } from 'rxjs';
import { NotificationService } from '../services/notification';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

// Mutex to prevent multiple refresh calls at once
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // 1. Handle 401 (Unauthorized) - Attempt Refresh
      if (error.status === 401 && !req.url.includes('auth/login') && !req.url.includes('auth/refresh')) {
        return handle401Error(req, next, authService, router);
      }

      // 2. Handle Standard Errors
      let errorMessage = 'An unknown error occurred!';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side
        errorMessage = error.error.message;
      } else {
        // Server-side error
        
        // 1. CHECK FOR VALIDATION ARRAY (New Logic)
        // Express-validator returns { errors: [ { msg: '...' }, ... ] }
        if (error.error && error.error.errors && Array.isArray(error.error.errors)) {
          // Combine all validation messages into one string
          errorMessage = error.error.errors.map((e: any) => e.msg).join('\n');
        } 
        // 2. CHECK FOR STANDARD AppError
        else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } 
        // 3. FALLBACK
        else {
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }

      }

      // Don't show toast for 401s if we are handling them, 
      // but if refresh failed (which falls through here), we might want to.
      if (error.status !== 401) {
        notificationService.showError(errorMessage);
      }
      
      return throwError(() => error);
    })
  );
};

// Helper function to handle Token Refresh
const handle401Error = (request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService, router: Router) => {
  
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((token: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(token.accessToken);
        
        // Retry the original request with the new token
        return next(addToken(request, token.accessToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        // Refresh failed - Logout user
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // If already refreshing, wait for the tokenSubject to emit a value
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(jwt => {
        return next(addToken(request, jwt!));
      })
    );
  }
};

const addToken = (request: HttpRequest<any>, token: string) => {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
};