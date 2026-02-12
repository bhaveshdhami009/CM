import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // 1. Check Login Status
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Check Role Permissions
  // We get the user from the Signal we created earlier
  const user = authService.currentUser();
  const userRole = user ? user.role : 0;

  // Read the required role from the route data (populated by route-generator)
  const requiredRole = route.data['minRole'];

  if (requiredRole !== undefined && userRole < requiredRole) {
    // User is logged in but permission is too low
    console.warn(`Access Denied: User Role ${userRole} < Required ${requiredRole}`);
    router.navigate(['/dashboard']); // Redirect to a safe page
    return false;
  }

  return true;
};