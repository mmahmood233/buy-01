import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <a routerLink="/products">E-Commerce</a>
        </div>
        <div class="navbar-menu">
          <a routerLink="/products" class="nav-link">Products</a>
          @if (authService.currentUser()) {
            @if (authService.isSeller()) {
              <a routerLink="/seller/dashboard" class="nav-link">Dashboard</a>
            }
            <span class="nav-user">{{ authService.currentUser()?.name }}</span>
            <button (click)="logout()" class="btn btn-secondary">Logout</button>
          } @else {
            <a routerLink="/login" class="nav-link">Login</a>
            <a routerLink="/register" class="nav-link">Register</a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 15px 0;
      margin-bottom: 30px;
    }

    .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-brand a {
      font-size: 24px;
      font-weight: bold;
      color: #007bff;
      text-decoration: none;
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .nav-link {
      color: #333;
      text-decoration: none;
      font-weight: 500;
    }

    .nav-link:hover {
      color: #007bff;
    }

    .nav-user {
      color: #666;
      font-weight: 500;
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
