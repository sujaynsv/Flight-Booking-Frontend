import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      console.log('AuthGuard checking access to:', state.url, 'isLoggedIn:', isLoggedIn);
      
      if (isLoggedIn) {
        console.log('User is logged in, allowing access');
        return true;
      } else {
        console.log('User not logged in, redirecting to /login');
        router.navigate(['/login'], { 
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
    })
  );
};
