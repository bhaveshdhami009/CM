import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { ThemeService } from './theme';
import { LoginDto } from '../../shared/models/dtos'; // Import DTOs
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  email: string;
  role: number;
  orgId: number | null;
  accent?: string;
  is_dark_mode?: boolean;
  full_name?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';
  private refreshKey = 'refresh_token'; 

  currentUser = signal<User | null>(null);

  constructor(
    private http: HttpClient, 
    private themeService: ThemeService,
    private router: Router
  ) {
    this.loadUserFromToken();
  }

  // Updated Login to handle Remember Me and Refresh Token
  // Note: DTO handles email/pass, rememberMe is often separate UI flag or merged.
  // We accept LoginDto + rememberMe boolean.
  login(credentials: LoginDto, rememberMe: boolean): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { ...credentials, rememberMe }).pipe(
      tap(response => this.saveTokens(response.accessToken, response.refreshToken))
    );
  }

  private saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshKey, refreshToken);
    this.decodeAndSetUser(accessToken);
  }

  logout() {
    const refreshToken = localStorage.getItem(this.refreshKey);

    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe({
        next: () => this.performLocalLogout(),
        error: () => this.performLocalLogout() 
      });
    } else {
      this.performLocalLogout();
    }
  }

  private performLocalLogout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem('theme');
    localStorage.removeItem('accent');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // --- Session Management APIs ---

  changePassword(data: any): Observable<any> {
    // You could create a ChangePasswordDto for strictness if desired
    return this.http.post(`${this.apiUrl}/change-password`, data);
  }

  getSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sessions`);
  }

  revokeSession(sessionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sessions/${sessionId}`);
  }
  
  //register(userData: RegisterDto): Observable<any> {
  //  return this.http.post(`${this.apiUrl}/register`, userData);
  //}
  
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem(this.refreshKey);
    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => {
        this.saveTokens(response.accessToken, response.refreshToken);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private decodeAndSetUser(token: string) {
    try {
      const decoded: any = jwtDecode(token);
      this.currentUser.set(decoded.user);
      
      const localAccent = localStorage.getItem('accent');
      const localTheme = localStorage.getItem('theme'); 

      if (localAccent) {
        this.themeService.setAccentColor(localAccent);
      } else if (decoded.user.accent) {
        this.themeService.setAccentColor(decoded.user.accent);
      }

      if (!localTheme && decoded.user.is_dark_mode !== undefined) {
        this.themeService.setDarkMode(decoded.user.is_dark_mode);
      }
    } catch (error) {
      this.logout(); // If token invalid
    }
  }

  private loadUserFromToken() {
    const token = this.getToken();
    if (token) this.decodeAndSetUser(token);
  }
}