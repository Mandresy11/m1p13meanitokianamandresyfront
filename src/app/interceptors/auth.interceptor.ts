import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Intercepteur JWT
 * Ajoute automatiquement le token Bearer à chaque requête HTTP sortante.
 * Comme ça on n'a pas besoin de l'ajouter manuellement dans chaque service.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Récupérer le token depuis le localStorage
  const token = localStorage.getItem('token');

  // Si un token existe, on clone la requête en ajoutant le header Authorization
  if (token) {
    const reqAvecToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(reqAvecToken);
  }

  // Sinon on laisse passer la requête telle quelle (routes publiques)
  return next(req);
};
