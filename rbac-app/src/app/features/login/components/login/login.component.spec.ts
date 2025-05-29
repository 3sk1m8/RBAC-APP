import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth.service';
import { User, Role } from '../../../../core/models/user.model';
import { SharedModule } from '../../../../shared/shared.module';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let messageService: jest.Mocked<MessageService>;

  beforeEach(async () => {
    const authServiceMock = {
      login: jest.fn(),
      currentUserValue: null
    } as unknown as jest.Mocked<AuthService>;
    
    const routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;
    
    const messageServiceMock = {
      add: jest.fn()
    } as unknown as jest.Mocked<MessageService>;

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        SharedModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MessageService, useValue: messageServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {}
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    messageService = TestBed.inject(MessageService) as jest.Mocked<MessageService>;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should not submit if form is invalid', () => {
    // Form is empty at this point
    component.onSubmit();
    
    expect(component.submitted).toBe(true);
    expect(component.loginForm.invalid).toBe(true);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should navigate to admin page on successful admin login', fakeAsync(() => {
    const mockAdminUser: User = {
      id: 1,
      username: 'admin',
      password: '',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: Role.Admin,
      token: 'fake-token'
    };
    
    authService.login.mockReturnValue(of(mockAdminUser));
    
    // Fill form
    component.loginForm.setValue({
      username: 'admin',
      password: 'password'
    });
    
    component.onSubmit();
    tick();
    
    expect(authService.login).toHaveBeenCalledWith({
      username: 'admin', 
      password: 'password'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/admin/users']);
    expect(component.loading).toBe(true);
  }));

  it('should navigate to profile page on successful user login', fakeAsync(() => {
    const mockUser: User = {
      id: 2,
      username: 'user',
      password: '',
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@example.com',
      role: Role.User,
      token: 'fake-token'
    };
    
    authService.login.mockReturnValue(of(mockUser));
    
    component.loginForm.setValue({
      username: 'user',
      password: 'password'
    });
    
    component.onSubmit();
    tick();
    
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  }));

  it('should display error message on login failure', fakeAsync(() => {
    const errorMessage = 'Invalid credentials';
    authService.login.mockReturnValue(throwError(() => new Error(errorMessage)));
    
    component.loginForm.setValue({
      username: 'wrong',
      password: 'wrong'
    });
    
    component.onSubmit();
    tick();
    
    expect(component.errorMessage).toBe(errorMessage);
    expect(component.loading).toBe(false);
    // Verify the error state instead
    expect(component.errorMessage).toBeTruthy();
  }));
});

// Separate describe block for the already logged in test
describe('LoginComponent with logged in user', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    // Create mock with an already logged in admin user
    const loggedInAuthServiceMock = {
      login: jest.fn(),
      currentUserValue: {
        id: 1,
        username: 'admin',
        password: '',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: Role.Admin,
        token: 'fake-token'
      }
    } as unknown as jest.Mocked<AuthService>;
    
    const routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        SharedModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: loggedInAuthServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MessageService, useValue: { add: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {}
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    
    fixture.detectChanges();
  });

  it('should redirect if user is already logged in', () => {
    expect(router.navigate).toHaveBeenCalledWith(['/admin/users']);
  });
}); 