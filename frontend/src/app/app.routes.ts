import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
//import { RegisterComponent } from './features/auth/register/register';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';
import { MENU_CONFIG } from './core/config/menu.config'; // Updated Import Name
import { generateRoutes } from './core/utils/route-generator';
import { guestGuard } from './core/guards/guest'; 

export const routes: Routes = [
  // 1. Public Routes (Keep these manual)
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [guestGuard] // <--- Add this
  },
  //{ 
  //  path: 'register', 
  //  component: RegisterComponent,
  //  canActivate: [guestGuard] // <--- Add this
  //},

  // 2. Protected Shell
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Pass the groups to the generator
      ...generateRoutes(MENU_CONFIG), 
      
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'login' }
];