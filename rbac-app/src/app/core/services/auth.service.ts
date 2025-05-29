import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, Role } from '../models/user.model';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = '/api/auth'; // intercepted by fake backend

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    let storedUser = null;
    if (isPlatformBrowser(this.platformId)) {
      const storedUserStr = localStorage.getItem('currentUser');
      if (storedUserStr) {
        try {
          storedUser = JSON.parse(storedUserStr);
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
    }
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginRequest: LoginRequest): Observable<User> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        map(response => {
          // User details and JWT token local storage
          const user: User = {
            id: response.user.id,
            username: response.user.username,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            password: '',
            role: response.user.role as Role,
            token: response.token
          };
          
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          return throwError(() => new Error('Invalid username or password'));
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  hasRole(role: Role): boolean {
    return this.currentUserValue?.role === role;
  }
}
