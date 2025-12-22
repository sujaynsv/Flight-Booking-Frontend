import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowedRoles = route.data['roles'] as string[] | undefined;
    const user = this.auth.getCurrentUserValue();

    if (!allowedRoles || !user) {
      this.router.navigate(['/login']);
      return false;
    }

    if (!allowedRoles.includes(user.role ?? '')) {
      if (user.role === 'ADMIN') {
        this.router.navigate(['/airlines']);
      } else {
        this.router.navigate(['/search']);
      }
      return false;
    }

    return true;
  }
}
