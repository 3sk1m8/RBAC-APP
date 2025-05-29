import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { User, Role } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all users', () => {
    // Arrange
    const mockUsers: User[] = [
      { 
        id: 1, 
        username: 'admin', 
        password: 'secret', 
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@admin.com',
        role: Role.Admin,
        token: 'fake-token'
      },
      { 
        id: 2, 
        username: 'user', 
        password: 'secret', 
        firstName: 'Normal',
        lastName: 'User',
        email: 'user@user.com',
        role: Role.User,
        token: 'fake-token'
      }
    ];

    // Act
    service.getAll().subscribe(users => {
      // Assert
      expect(users.length).toBe(2);
      expect(users[0].username).toBe('admin');
      expect(users[0].password).toBe(''); // Password should be removed
      expect(users[1].username).toBe('user');
      expect(users[1].password).toBe(''); // Password should be removed
    });

    // Assert
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should get user by id', () => {
    // Arrange
    const mockUser: User = { 
      id: 1, 
      username: 'admin', 
      password: 'secret', 
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@admin.com',
      role: Role.Admin,
      token: 'fake-token'
    };

    // Act
    service.getById(1).subscribe(user => {
      // Assert
      expect(user.id).toBe(1);
      expect(user.username).toBe('admin');
      expect(user.password).toBe(''); // Password should be removed
      expect(user.role).toBe(Role.Admin);
    });

    // Assert
    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should handle errors when getting all users', () => {
    // Act
    service.getAll().subscribe({
      error: (error) => {
        // Assert
        expect(error.status).toBe(500);
        expect(error.error).toBe('Internal Server Error');
      }
    });

    // Assert
    const req = httpMock.expectOne('/api/users');
    req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle errors when getting user by id', () => {
    // Act
    service.getById(999).subscribe({
      error: (error) => {
        // Assert
        expect(error.status).toBe(404);
        expect(error.error).toBe('User not found');
      }
    });

    // Assert
    const req = httpMock.expectOne('/api/users/999');
    req.flush('User not found', { status: 404, statusText: 'Not Found' });
  });
});