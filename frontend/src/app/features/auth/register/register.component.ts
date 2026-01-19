import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="auth-container">
        <div class="card">
          <h2>Register</h2>
          
          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="name">Name</label>
              <input 
                type="text" 
                id="name" 
                formControlName="name" 
                class="form-control"
                placeholder="Enter your name">
              @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
                <div class="error">Name must be between 2 and 100 characters</div>
              }
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                class="form-control"
                placeholder="Enter your email">
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
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
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <div class="error">Password must be at least 8 characters</div>
              }
            </div>

            <div class="form-group">
              <label for="role">Register as</label>
              <select id="role" formControlName="role" class="form-control">
                <option value="CLIENT">Client</option>
                <option value="SELLER">Seller</option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="registerForm.invalid || loading">
              {{ loading ? 'Registering...' : 'Register' }}
            </button>
          </form>

          <p class="auth-link">
            Already have an account? <a routerLink="/login">Login here</a>
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['CLIENT', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          this.loading = false;
        }
      });
    }
  }
}
