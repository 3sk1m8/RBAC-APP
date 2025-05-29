import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';

import { AuthService } from './auth.service';
import { User, Role } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve current user from localStorage on initialization', () => {
    // Destroy existing module to get a fresh service
    TestBed.resetTestingModule();
    
    // Arrange
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      password: '',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      role: Role.User,
      token: 'fake-token'
    };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    
    // Set up new testing module
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    
    // Act - create a new service instance
    const newService = TestBed.inject(AuthService);
    
    // Assert
    expect(newService.currentUserValue).toEqual(mockUser);
  });

  it('should login successfully', () => {
    // Arrange
    const mockLoginRequest = { username: 'admin', password: 'admin' };
    const mockResponse = {
      token: 'fake-jwt-token',
      user: {
        id: 1,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@admin.com',
        role: 'Admin'
      }
    };
    
    // Act
    let result: User | undefined;
    service.login(mockLoginRequest).subscribe(user => {
      result = user;
    });
    
    // Assert
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
    
    expect(result).toBeDefined();
    expect(result?.token).toEqual('fake-jwt-token');
    expect(result?.role).toEqual(Role.Admin);
    expect(localStorage.getItem('currentUser')).toBeTruthy();
  });

  it('should handle login error', () => {
    // Arrange
    const mockLoginRequest = { username: 'wrong', password: 'wrong' };
    
    // Act
    let error: any;
    service.login(mockLoginRequest).subscribe({
      next: () => fail('should have failed with a 401'),
      error: (e) => { error = e; }
    });
    
    // Assert
    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ message: 'Invalid username or password' }, { status: 401, statusText: 'Unauthorized' });
    
    expect(error).toBeDefined();
    expect(error.message).toContain('Invalid username or password');
    expect(localStorage.getItem('currentUser')).toBeNull();
  });

  it('should logout and clear localStorage', () => {
    // Arrange
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      password: '',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      role: Role.User,
      token: 'fake-token'
    };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    service = TestBed.inject(AuthService);
    
    // Act
    service.logout();
    
    // Assert
    expect(localStorage.getItem('currentUser')).toBeNull();
    expect(service.currentUserValue).toBeNull();
  });

  it('should check if user is logged in', () => {
    // Destroy existing module to get a fresh service
    TestBed.resetTestingModule();
    
    // Arrange
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      password: '',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      role: Role.User,
      token: 'fake-token'
    };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    
    // Set up new testing module
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    
    // Act - create a new service instance
    const newService = TestBed.inject(AuthService);
    
    // Assert
    expect(newService.isLoggedIn()).toBeTruthy();
    
    // After logout
    newService.logout();
    expect(newService.isLoggedIn()).toBeFalsy();
  });

  it('should check if user has specific role', () => {
    // Destroy existing module to get a fresh service
    TestBed.resetTestingModule();
    
    // Arrange
    const mockAdminUser: User = {
      id: 1,
      username: 'admin',
      password: '',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@admin.com',
      role: Role.Admin,
      token: 'fake-token'
    };
    localStorage.setItem('currentUser', JSON.stringify(mockAdminUser));
    
    // Set up new testing module
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    
    // Act - create a new service instance
    const newService = TestBed.inject(AuthService);
    
    // Assert
    expect(newService.hasRole(Role.Admin)).toBeTruthy();
    expect(newService.hasRole(Role.User)).toBeFalsy();
  });
});