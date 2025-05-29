import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { fakeBackendInterceptor } from './fake-backend.interceptor';
import { Role } from '../models/user.model';

describe('fakeBackendInterceptor', () => {
  const next = jest.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({});
    next.mockReset();
  });

  it('should be created', () => {
    const interceptor = (req: HttpRequest<any>, next: any) => 
      TestBed.runInInjectionContext(() => fakeBackendInterceptor(req, next));
    expect(interceptor).toBeTruthy();
  });

  describe('Authentication', () => {
    it('should authenticate valid user', async () => {
      // Arrange
      const req = new HttpRequest('POST', '/api/auth/login', {
        username: 'admin',
        password: 'admin'
      });

      // Act
      const result$ = TestBed.runInInjectionContext(() => 
        fakeBackendInterceptor(req, next)
      );
      const response = await firstValueFrom(result$) as HttpResponse<any>;

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.token).toMatch(/^fake-jwt-token/);
      expect(response.body.user).toMatchObject({
        username: 'admin',
        role: Role.Admin
      });
    });

    it('should reject invalid credentials', async () => {
      // Arrange
      const req = new HttpRequest('POST', '/api/auth/login', {
        username: 'wrong',
        password: 'wrong'
      });

      // Act & Assert
      await expect(async () => {
        const result$ = TestBed.runInInjectionContext(() => 
          fakeBackendInterceptor(req, next)
        );
        await firstValueFrom(result$);
      }).rejects.toMatchObject({
        status: 401,
        error: {
          message: expect.stringContaining('Username or password is incorrect')
        }
      });
    });
  });

  describe('User Management', () => {
    const authHeader = new HttpHeaders().set(
      'Authorization',
      'Bearer fake-jwt-token.1.' + Date.now()
    );

    it('should get all users for admin', async () => {
      // Arrange
      const req = new HttpRequest('GET', '/api/users', null, {
        headers: authHeader
      });

      // Act
      const result$ = TestBed.runInInjectionContext(() => 
        fakeBackendInterceptor(req, next)
      );
      const response = await firstValueFrom(result$) as HttpResponse<any>;

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].password).toBeUndefined();
      expect(response.body.map((u: any) => u.role))
        .toEqual([Role.Admin, Role.User]);
    });

    it('should get user by id when authorized', async () => {
      // Arrange
      const req = new HttpRequest('GET', '/api/users/1', null, {
        headers: authHeader
      });

      // Act
      const result$ = TestBed.runInInjectionContext(() => 
        fakeBackendInterceptor(req, next)
      );
      const response = await firstValueFrom(result$) as HttpResponse<any>;

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.password).toBeUndefined();
    });

    it('should reject unauthorized user access', async () => {
      // Arrange
      const req = new HttpRequest('GET', '/api/users');

      // Act & Assert
      await expect(async () => {
        const result$ = TestBed.runInInjectionContext(() => 
          fakeBackendInterceptor(req, next)
        );
        await firstValueFrom(result$);
      }).rejects.toMatchObject({
        status: 401,
        error: {
          message: 'Unauthorized'
        }
      });
    });

    it('should return 404 for non-existent user', async () => {
      // Arrange
      const req = new HttpRequest('GET', '/api/users/999', null, {
        headers: authHeader
      });

      // Act & Assert
      await expect(async () => {
        const result$ = TestBed.runInInjectionContext(() => 
          fakeBackendInterceptor(req, next)
        );
        await firstValueFrom(result$);
      }).rejects.toMatchObject({
        status: 404,
        error: {
          message: 'Not found'
        }
      });
    });
  });

  describe('Request Handling', () => {
    it('should pass through unhandled routes', async () => {
      // Arrange
      const req = new HttpRequest('GET', '/api/unhandled');
      const mockResponse = new HttpResponse({ status: 200, body: 'passthrough' });
      next.mockResolvedValue(mockResponse);

      // Act
      const result$ = TestBed.runInInjectionContext(() => 
        fakeBackendInterceptor(req, next)
      );
      const response = await firstValueFrom(result$);

      // Assert
      expect(next).toHaveBeenCalledWith(req);
      expect(response).toBe(mockResponse);
    });
  });
});