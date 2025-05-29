import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { User, Role } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { MessageService } from 'primeng/api';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css'],
  standalone: true,
  imports: [SharedModule]
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  loading = true;
  protected readonly Role = Role; // Expose Role enum to template

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    // Check if current user is admin
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (currentUser.role !== Role.Admin) {
      this.router.navigate(['/profile']);
      return;
    }

    this.loading = true;
    this.userService.getAll()
      .pipe(
        catchError(error => {
          console.error('Error loading users:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load users',
            life: 3000
          });
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(users => {
        this.users = users;
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  viewProfile(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.router.navigate(['/profile']);
    }
  }

  formatRole(role: Role): string {
    return role.toString();
  }

  getRoleSeverity(role: Role): string {
    return role === Role.Admin ? 'danger' : 'info';
  }
}