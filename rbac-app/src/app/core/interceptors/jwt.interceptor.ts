import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const currentUser = authService.currentUserValue;
  
  if (currentUser && currentUser.token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.token}`
      }
    });
    return next(clonedReq);
  }
  
  return next(req);
};