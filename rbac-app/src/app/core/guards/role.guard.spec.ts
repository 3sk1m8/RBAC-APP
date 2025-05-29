import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { roleGuard } from './role.guard';
import { Role, User } from '../models/user.model';

describe('roleGuard', () => {
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;

  beforeEach(() => {
    const authServiceSpy = {
      currentUserValue: null,
      hasRole: jest.fn()
    } as unknown as jest.Mocked<AuthService>;
    
    const routerSpy = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  it('should allow access when user has required role', () => {
    // Arrange
    const route = new ActivatedRouteSnapshot();
    route.data = { role: Role.Admin };

    const mockUser: Partial<User> = {
      id: 1,
      username: 'admin',
      role: Role.Admin
    };

    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });
    authService.hasRole.mockReturnValue(true);

    // Act
    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));

    // Assert
    expect(result).toBe(true);
    expect(authService.hasRole).toHaveBeenCalledWith(Role.Admin);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect admin to admin page when accessing unauthorized route', () => {
    // Arrange
    const route = new ActivatedRouteSnapshot();
    route.data = { role: Role.User };

    const mockUser: Partial<User> = {
      id: 1,
      username: 'admin',
      role: Role.Admin
    };

    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });
    authService.hasRole.mockReturnValue(false);

    // Act
    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));

    // Assert
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/users']);
  });

  it('should redirect user to profile when accessing unauthorized route', () => {
    // Arrange
    const route = new ActivatedRouteSnapshot();
    route.data = { role: Role.Admin };

    const mockUser: Partial<User> = {
      id: 2,
      username: 'user',
      role: Role.User
    };

    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });
    authService.hasRole.mockReturnValue(false);

    // Act
    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));

    // Assert
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should allow access when no role is specified', () => {
    // Arrange
    const route = new ActivatedRouteSnapshot();
    route.data = {};

    const mockUser: Partial<User> = {
      id: 1,
      username: 'user',
      role: Role.User
    };

    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });

    // Act
    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));

    // Assert
    expect(result).toBe(true);
    expect(authService.hasRole).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow access when user is not logged in', () => {
    // Arrange
    const route = new ActivatedRouteSnapshot();
    route.data = { role: Role.User };

    Object.defineProperty(authService, 'currentUserValue', {
      get: () => null
    });

    // Act
    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));

    // Assert
    expect(result).toBe(true);
  });
});