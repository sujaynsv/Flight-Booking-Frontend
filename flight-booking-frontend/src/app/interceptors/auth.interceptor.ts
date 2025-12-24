import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Don't need to add token manually - cookies are sent automatically
    // But if you want to add from localStorage:
    // const token = this.authService.getToken();
    // if (token) {
    //   req = req.clone({
    //     setHeaders: { Authorization: `Bearer ${token}` }
    //   });
    // }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Check for password expired header
        if (error.headers.get('X-Password-Expired') === 'true') {
          console.warn('Password expired, redirecting to change password page');
          this.router.navigate(['/change-password']);
          return EMPTY;  // Stop the error from propagating
        }

        // Check for 401 with password expired
        if (error.status === 401) {
          const passwordExpired = error.headers.get('X-Password-Expired');
          if (passwordExpired === 'true') {
            console.warn('Password expired (401), redirecting...');
            this.router.navigate(['/change-password']);
            return EMPTY;
          }
        }

        // Other errors - pass through
        return throwError(() => error);
      })
    );
  }
}
