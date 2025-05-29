import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProfileDetailsComponent } from './profile-details.component';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { User, Role } from '../../../../core/models/user.model';
import { SharedModule } from '../../../../shared/shared.module';

describe('ProfileDetailsComponent', () => {
  let component: ProfileDetailsComponent;
  let fixture: ComponentFixture<ProfileDetailsComponent>;
  let authService: { currentUserValue: User | null; logout: jest.Mock };
  let userService: { getById: jest.Mock };
  let router: { navigate: jest.Mock };

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

  beforeEach(async () => {
    authService = {
      currentUserValue: mockUser,
      logout: jest.fn()
    };
    userService = {
      getById: jest.fn().mockReturnValue(of(mockUser))
    };
    router = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SharedModule, ProfileDetailsComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UserService, useValue: userService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user details on init when user is authenticated', () => {
    // Act
    fixture.detectChanges();

    // Assert
    expect(userService.getById).toHaveBeenCalledWith(mockUser.id);
    expect(component.currentUser).toEqual(mockUser);
    expect(component.loading).toBe(false);
  });

  it('should redirect to login when no current user on init', () => {
    // Arrange
    authService.currentUserValue = null;

    // Act
    fixture.detectChanges();

    // Assert
    expect(userService.getById).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle error when loading user details', () => {
    // Arrange
    userService.getById.mockReturnValue(throwError(() => new Error('Failed to load user')));

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.loading).toBe(false);
    expect(component.currentUser).toBeNull();
  });

  it('should logout and redirect to login', () => {
    // Act
    component.logout();

    // Assert
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should expose Role enum to template', () => {
    // Assert
    expect(component['Role']).toBeDefined();
    expect(component['Role'].Admin).toBe(Role.Admin);
    expect(component['Role'].User).toBe(Role.User);
  });
});