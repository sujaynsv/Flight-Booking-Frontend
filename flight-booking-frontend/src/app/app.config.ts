import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';

/**
 * APP CONFIG: Global configuration for the application
 * 
 * What we provide:
 * - Router: enables navigation/routing
 * - HttpClient: enables API calls (http.post, http.get, etc)
 * - Interceptors: can intercept and modify HTTP requests
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Setup routing with our routes
    provideRouter(routes),
    
    // Setup HTTP client for API calls
    // withInterceptorsFromDi allows custom interceptors later
    provideHttpClient(
      withInterceptorsFromDi()
    ),
  ],
};
