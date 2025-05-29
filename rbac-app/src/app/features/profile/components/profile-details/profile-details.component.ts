import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, Role } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css'],
  standalone: true,
  imports: [SharedModule]
})
export class ProfileDetailsComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;
  protected readonly Role = Role; // Expose Role enum to template

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get the current user
    const user = this.authService.currentUserValue;
    
    if (user) {
      // Fetch user details
      this.userService.getById(user.id).subscribe({
        next: (userData) => {
          this.currentUser = userData;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      // Redirect to login if no current user
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}