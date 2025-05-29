import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

import { UsersListComponent } from './users-list.component';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User, Role } from '../../../../core/models/user.model';
import { SharedModule } from '../../../../shared/shared.module';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;
  let userService: { getAll: jest.Mock };
  let authService: { currentUserValue: User | null };
  let messageService: { add: jest.Mock };
  let router: { navigate: jest.Mock };

  const mockUsers: User[] = [
    {
      id: 1,
      username: 'admin',
      password: '',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      role: Role.Admin,
      token: 'fake-token-1'
    },
    {
      id: 2,
      username: 'user',
      password: '',
      firstName: 'Normal',
      lastName: 'User',
      email: 'user@test.com',
      role: Role.User,
      token: 'fake-token-2'
    }
  ];

  beforeEach(async () => {
    userService = {
      getAll: jest.fn().mockReturnValue(of(mockUsers))
    };

    authService = {
      currentUserValue: mockUsers[0] // Admin user
    };

    messageService = {
      add: jest.fn()
    };

    router = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SharedModule, UsersListComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: AuthService, useValue: authService },
        { provide: MessageService, useValue: messageService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    // Act
    fixture.detectChanges();

    // Assert
    expect(userService.getAll).toHaveBeenCalled();
    expect(component.users).toEqual(mockUsers);
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading users', () => {
    // Arrange
    const errorMessage = 'Failed to load users';
    userService.getAll.mockReturnValue(throwError(() => new Error(errorMessage)));
    
    // Act
    component.loadUsers();
    
    // Assert
    expect(component.users).toEqual([]);
    expect(component.loading).toBe(false);
    // Verify the error handling worked by checking the empty users array
  });

  it('should redirect to login if current user is null', () => {
    // Arrange
    authService.currentUserValue = null;

    // Act
    fixture.detectChanges();

    // Assert
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to profile if current user is not admin', () => {
    // Arrange
    authService.currentUserValue = mockUsers[1]; // Regular user

    // Act
    fixture.detectChanges();

    // Assert
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should format role for display', () => {
    // Act & Assert
    expect(component.formatRole(Role.Admin)).toBe('Admin');
    expect(component.formatRole(Role.User)).toBe('User');
  });

  it('should get role severity class', () => {
    // Act & Assert
    expect(component.getRoleSeverity(Role.Admin)).toBe('danger');
    expect(component.getRoleSeverity(Role.User)).toBe('info');
  });
});