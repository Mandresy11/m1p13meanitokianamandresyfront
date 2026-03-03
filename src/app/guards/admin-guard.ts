// guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../features/auth/auth.service';

export const adminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estConnecte() && authService.estAdmin()) {
    return true;
  }

  if (authService.obtenirRole() === 'shop') {
    const shopId = localStorage.getItem('shopId')
      ? JSON.parse(localStorage.getItem('shopId')!)
      : null;
    const routeShopId = route.paramMap.get('id');
    if (shopId && routeShopId && shopId === routeShopId) return true;
  }

  // redirect to home if not admin
  router.navigate(['/']);
  return false;
};
