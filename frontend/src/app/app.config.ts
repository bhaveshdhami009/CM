import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // <-- Import withInterceptors

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor'; // <-- Import your interceptor
import { errorInterceptor } from './core/interceptors/error.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Update this line:
	provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])) // <-- Add it here
  ]
};