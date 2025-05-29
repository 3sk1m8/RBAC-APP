import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import { User, Role } from '../models/user.model';

// Sample users
const users: User[] = [
  { id: 1, username: 'admin', password: 'admin', firstName: 'Admin', lastName: 'User', email: 'admin@admin.com', role: Role.Admin },
  { id: 2, username: 'user', password: 'user', firstName: 'Normal', lastName: 'User', email: 'user@user.com', role: Role.User }
];

export const fakeBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const { url, method, headers, body } = req;

  // Delayed observable wrap to simulate server API call
  return of(null)
    .pipe(mergeMap(handleRoute))
    .pipe(materialize()) // materialize and dematerialize call to ensure delay even if an error is thrown
    .pipe(delay(500))
    .pipe(dematerialize());

  function handleRoute() {
    switch (true) {
      case url.endsWith('/api/auth/login') && method === 'POST':
        return authenticate();
      case url.endsWith('/api/users') && method === 'GET':
        return getUsers();
      case url.match(/\/api\/users\/\d+$/) && method === 'GET':
        return getUserById();
      default:
        // Pass through any requests not handled above
        return next(req);
    }
  }

  // Route functions
  function authenticate() {
    const { username, password } = body as { username: string; password: string };
    const user = users.find(x => x.username === username && x.password === password);
    
    if (!user) return throwError(() => ({ status: 401, error: { message: 'Username or password is incorrect' } }));
    
    // Fake server token
    const token = `fake-jwt-token.${user.id}.${Date.now()}`;
    
    return of(new HttpResponse({ 
      status: 200, 
      body: {
        token,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      }
    }));
  }

  // Check for fake auth token in header and return users if valid
  function getUsers() {
    if (!isLoggedIn() || !isAdmin()) return unauthorized();
    return ok(users.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    }));
  }

  function getUserById() {
    if (!isLoggedIn()) return unauthorized();
    
    // Find user by id in the URL
    const urlParts = url.split('/');
    const id = parseInt(urlParts[urlParts.length - 1]);
    const user = users.find(x => x.id === id);

    // 404 if user not found
    if (!user) return notFound();

    // Admin access
    const currentUser = getCurrentUser();
    if (!currentUser || id !== currentUser.id && currentUser.role !== Role.Admin) return unauthorized();

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return ok(userWithoutPassword);
  }

  // Helper functions
  function ok(body?: any) {
    return of(new HttpResponse({ status: 200, body }));
  }

  function unauthorized() {
    return throwError(() => ({ status: 401, error: { message: 'Unauthorized' } }));
  }

  function notFound() {
    return throwError(() => ({ status: 404, error: { message: 'Not found' } }));
  }

  function isLoggedIn() {
    return headers.get('Authorization')?.startsWith('Bearer fake-jwt-token');
  }

  function isAdmin() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === Role.Admin;
  }

  function getCurrentUser() {
    const authHeader = headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer fake-jwt-token')) return null;
    
    // Extract user id from token
    const tokenParts = authHeader.split('.');
    if (tokenParts.length < 2) return null;
    
    const userId = parseInt(tokenParts[1]);
    return users.find(x => x.id === userId) || null;
  }
};