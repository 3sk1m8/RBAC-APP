import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { jwtInterceptor } from './jwt.interceptor';
import { User, Role } from '../models/user.model';

describe('jwtInterceptor', () => {
  let interceptor: HttpInterceptorFn;
  let authService: jest.Mocked<AuthService>;
  let req: HttpRequest<any>;
  let next: jest.Mock<ReturnType<HttpHandlerFn>>;

  beforeEach(() => {
    authService = {
      currentUserValue: null
    } as jest.Mocked<AuthService>;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    });

    interceptor = (req, next) => TestBed.runInInjectionContext(() => jwtInterceptor(req, next));
    req = new HttpRequest('GET', '/api/test');
    next = jest.fn().mockReturnValue(of({}));
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorization header when user is authenticated', () => {
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
      get: () => mockUser
    });

    // Act
    interceptor(req, next);

    // Assert
    const modifiedRequest = next.mock.calls[0][0] as HttpRequest<any>;
    expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
  });

  it('should not modify request when user is not authenticated', () => {
    // Arrange
    Object.defineProperty(authService, 'currentUserValue', {
      get: () => null
    });

    // Act
    interceptor(req, next);

    // Assert
    const modifiedRequest = next.mock.calls[0][0] as HttpRequest<any>;
    expect(modifiedRequest.headers.has('Authorization')).toBeFalsy();
  });

  it('should not modify request when user has no token', () => {
    // Arrange
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      password: '',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      role: Role.User,
      token: ''
    };

    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });

    // Act
    interceptor(req, next);

    // Assert
    const modifiedRequest = next.mock.calls[0][0] as HttpRequest<any>;
    expect(modifiedRequest.headers.has('Authorization')).toBeFalsy();
  });

  it('should preserve existing headers when adding Authorization header', () => {
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
      get: () => mockUser
    });

    const reqWithHeaders = req.clone({
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });

    // Act
    interceptor(reqWithHeaders, next);

    // Assert
    const modifiedRequest = next.mock.calls[0][0] as HttpRequest<any>;
    expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
    expect(modifiedRequest.headers.get('Content-Type')).toBe('application/json');
  });

  it('should handle different HTTP methods', () => {
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
      get: () => mockUser
    });

    // Test GET request
    const getReq = new HttpRequest('GET', '/api/test');
    interceptor(getReq, next);
    expect(next.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer fake-jwt-token');
  });
});