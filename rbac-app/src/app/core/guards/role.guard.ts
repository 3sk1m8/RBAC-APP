import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  const currentUser = authService.currentUserValue;
  
  // Check route has role data and user has required role
  if (currentUser && route.data['role']) {
    const requiredRole = route.data['role'] as Role;
    
    //User has required role, allow access
    if (authService.hasRole(requiredRole)) {
      return true;
    }
    
    // User doesn't have required role, redirect based on their role
    if (currentUser.role === Role.Admin) {
      router.navigate(['/admin/users']);
    } else {
      router.navigate(['/profile']);
    }
    
    return false;
  }

  // Role not specified or user not logged in
  return true;
};