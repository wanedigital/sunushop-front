import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/authservice.service';

export const visitorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // L'utilisateur a un token. Vérifions si son rôle est valide.
    const isAdmin = authService.isAdmin();
    const isVendeur = authService.isVendeur();
    const isClient = authService.isClient();

    if (isAdmin || isVendeur || isClient) {
      // L'utilisateur a un rôle valide, on le redirige loin des pages visiteur.
      if (isAdmin) return router.createUrlTree(['/admin']);
      if (isVendeur) return router.createUrlTree(['/vendeur']);
      if (isClient) return router.createUrlTree(['/client']);
    }

    // Si on arrive ici, l'utilisateur a un token mais pas de rôle valide.
    // C'est un état invalide (ex: token corrompu). 
    // On le déconnecte pour nettoyer le mauvais état et on l'autorise à continuer comme visiteur.
    authService.logout();
    return true;

  } else {
    // L'utilisateur n'est pas connecté (pas de token), on autorise l'accès.
    return true;
  }
};
