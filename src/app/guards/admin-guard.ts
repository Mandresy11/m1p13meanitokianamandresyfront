// guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../features/auth/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estConnecte() && authService.estAdmin()) {
    return true;
  }
  // redirect to home if not admin
  router.navigate(['/']);
  return false;
};
