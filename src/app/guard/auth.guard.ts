import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/authservice.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getRole().pipe(
    map(currentRole => {
      // Si l'utilisateur est un "Client", il est refusé
      if (currentRole === 'Client') {
        return router.createUrlTree(['/unauthorized']);
      }

      // Si l'utilisateur est connecté et est "Administrateur" ou "client"
      if (authService.isAuthenticated() && (currentRole === 'Administrateur' || currentRole === 'Client')) {
        return true;
      }

      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    })
  );
};
