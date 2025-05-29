import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users'; // intercepted by fake backend

  constructor(private http: HttpClient) { }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl)
      .pipe(
        map(users => {
          // Remove password before returning
          return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return { ...userWithoutPassword, password: '' };
          });
        })
      );
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
      .pipe(
        map(user => {
          // Remove password before returning
          const { password, ...userWithoutPassword } = user;
          return { ...userWithoutPassword, password: '' };
        })
      );
  }
}
