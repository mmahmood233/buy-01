import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Seller Dashboard</h1>
      <div class="card">
        <p>Dashboard content will be implemented in the next step.</p>
      </div>
    </div>
  `
})
export class DashboardComponent {}
