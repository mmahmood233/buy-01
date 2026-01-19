import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="auth-container">
        <div class="card">
          <h2>Login</h2>
          
          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                class="form-control"
                placeholder="Enter your email">
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <div class="error">Valid email is required</div>
              }
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                formControlName="password" 
                class="form-control"
                placeholder="Enter your password">
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <div class="error">Password is required</div>
              }
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || loading">
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </form>

          <p class="auth-link">
            Don't have an account? <a routerLink="/register">Register here</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      max-width: 400px;
      margin: 50px auto;
    }

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .btn {
      width: 100%;
      margin-top: 10px;
    }

    .auth-link {
      text-align: center;
      margin-top: 20px;
      color: #666;
    }

    .auth-link a {
      color: #007bff;
      text-decoration: none;
    }

    .auth-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
          this.loading = false;
        }
      });
    }
  }
}
