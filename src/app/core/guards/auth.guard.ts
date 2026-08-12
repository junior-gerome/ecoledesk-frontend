import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  //Si l'utilisateur est authentifie, autoriser l'acces, sinon,le rediriger vers /auth/login
  return auth.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
  // equivaut a 
  // if (auth.isAuthenticated()) {
  //   return true;
  // } else {
  //  return router.createUrlTree(['/auth/login']);  
  // }
    
  

};
