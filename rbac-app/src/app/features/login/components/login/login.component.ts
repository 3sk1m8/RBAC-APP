import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { SharedModule } from '../../../../shared/shared.module';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [SharedModule],
  providers: [HttpClient]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    // Redirect if already logged in
    if (this.authService.currentUserValue) {
      this.redirectBasedOnRole(this.authService.currentUserValue.role);
    }
    
    // Initialize form
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit(): void {
  }

  // Access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({
      username: this.f['username'].value,
      password: this.f['password'].value
    })
      .pipe(first())
      .subscribe({
        next: (user) => {
          this.redirectBasedOnRole(user.role);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Invalid username or password';
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: this.errorMessage,
            life: 3000
          });
          this.loading = false;
        }
      });
  }

  private redirectBasedOnRole(role: Role): void {
    if (role === Role.Admin) {
      this.router.navigate(['/admin/users']);
    } else {
      this.router.navigate(['/profile']);
    }
  }
}