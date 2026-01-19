import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Products</h1>

      @if (loading) {
        <p>Loading products...</p>
      } @else if (products.length === 0) {
        <div class="card">
          <p>No products available yet.</p>
        </div>
      } @else {
        <div class="product-grid">
          @for (product of products; track product.id) {
            <div class="product-card">
              <div class="product-image">
                <img src="https://via.placeholder.com/300x200" alt="{{ product.name }}">
              </div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-footer">
                  <span class="product-price">\${{ product.price.toFixed(2) }}</span>
                  <span class="product-quantity">Stock: {{ product.quantity }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    h1 {
      margin-bottom: 30px;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .product-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .product-image img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .product-info {
      padding: 15px;
    }

    .product-info h3 {
      margin-bottom: 10px;
      color: #333;
    }

    .product-description {
      color: #666;
      margin-bottom: 15px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-price {
      font-size: 20px;
      font-weight: bold;
      color: #007bff;
    }

    .product-quantity {
      color: #666;
      font-size: 14px;
    }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);

  products: Product[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }
}
