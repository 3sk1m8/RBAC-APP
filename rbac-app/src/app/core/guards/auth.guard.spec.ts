import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';
import { User, Role } from '../models/user.model';

describe('authGuard', () => {
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const mockAuthService = {} as AuthService;
    const getCurrentUserMock = jest.fn().mockReturnValue(null);
    Object.defineProperty(mockAuthService, 'currentUserValue', {
      get: getCurrentUserMock,
      configurable: true
    });
    authService = mockAuthService as jest.Mocked<AuthService>;
    router = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });

    route = new ActivatedRouteSnapshot();
    state = { url: '/test' } as RouterStateSnapshot;
  });

  it('should be created', () => {
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBeDefined();
  });

  it('should allow access when user is authenticated', () => {
    // Arrange
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      password: '',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      role: Role.User,
      token: 'fake-jwt-token'
    };

    Object.defineProperty(authService, 'currentUserValue', {
      get: jest.fn().mockReturnValue(mockUser),
      configurable: true
    });

    // Act
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    // Assert
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Arrange
    Object.defineProperty(authService, 'currentUserValue', {
      get: jest.fn().mockReturnValue(null),
      configurable: true
    });

    // Act
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    // Assert
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(
      ['/login'],
      { queryParams: { returnUrl: '/test' } }
    );
  });

  it('should preserve return URL when redirecting to login', () => {
    // Arrange
    Object.defineProperty(authService, 'currentUserValue', {
      get: jest.fn().mockReturnValue(null),
      configurable: true
    });
    state = { url: '/protected/resource' } as RouterStateSnapshot;

    // Act
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    // Assert
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(
      ['/login'],
      { queryParams: { returnUrl: '/protected/resource' } }
    );
  });
});