import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../features/auth/auth.service';

export const shopGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estConnecte() && authService.obtenirRole() === 'shop') {
    return true;
  }

  router.navigate(['/']);
  return false;
};
