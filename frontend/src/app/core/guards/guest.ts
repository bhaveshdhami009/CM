import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is ALREADY logged in, kick them to dashboard
  if (authService.isLoggedIn()) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  // Otherwise, let them access the page (Login/Register)
  return true;
};