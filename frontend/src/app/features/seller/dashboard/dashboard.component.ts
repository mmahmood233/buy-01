import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { MediaService } from '../../../core/services/media.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';
import { Media } from '../../../core/models/media.model';
import { ProductFormComponent } from '../product-form/product-form.component';
import { MediaUploadComponent } from '../media-upload/media-upload.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProductFormComponent, MediaUploadComponent],
  template: `
    <div class="container">
      <div class="dashboard-header">
        <h1>Seller Dashboard</h1>
        <button class="btn btn-primary" (click)="openProductForm()">
          + Add New Product
        </button>
      </div>

      @if (loading) {
        <p>Loading your products...</p>
      } @else if (products.length === 0) {
        <div class="card empty-state">
          <h3>No Products Yet</h3>
          <p>Start by creating your first product</p>
          <button class="btn btn-primary" (click)="openProductForm()">
            Create Product
          </button>
        </div>
      } @else {
        <div class="products-grid">
          @for (product of products; track product.id) {
            <div class="product-card">
              <div class="product-header">
                <h3>{{ product.name }}</h3>
                <div class="product-actions">
                  <button class="btn-icon" (click)="editProduct(product)" title="Edit">
                    ✏️
                  </button>
                  <button class="btn-icon" (click)="deleteProduct(product.id)" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
              
              <p class="product-description">{{ product.description }}</p>
              
              <div class="product-details">
                <div class="detail-item">
                  <span class="label">Price:</span>
                  <span class="value">\${{ product.price.toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Stock:</span>
                  <span class="value">{{ product.quantity }}</span>
                </div>
              </div>

              <div class="product-images">
                @if (product.imageIds.length > 0) {
                  <p class="images-count">{{ product.imageIds.length }} image(s)</p>
                } @else {
                  <p class="no-images">No images</p>
                }
                <button 
                  class="btn btn-secondary btn-sm" 
                  (click)="manageMedia(product)">
                  Manage Images
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (showProductForm) {
        <app-product-form
          [product]="selectedProduct"
          (save)="saveProduct($event)"
          (cancel)="closeProductForm()">
        </app-product-form>
      }

      @if (showMediaUpload && selectedProduct) {
        <div class="modal-overlay" (click)="closeMediaUpload()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Manage Images - {{ selectedProduct.name }}</h2>
              <button class="btn-close" (click)="closeMediaUpload()">✕</button>
            </div>
            <app-media-upload
              [productId]="selectedProduct.id"
              [mediaList]="currentMediaList"
              (mediaUploaded)="loadProductMedia(selectedProduct.id)"
              (mediaDeleted)="loadProductMedia(selectedProduct.id)">
            </app-media-upload>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .product-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
    }

    .product-header h3 {
      margin: 0;
      color: #333;
      flex: 1;
    }

    .product-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
      opacity: 0.7;
      transition: opacity 0.3s;
    }

    .btn-icon:hover {
      opacity: 1;
    }

    .product-description {
      color: #666;
      margin-bottom: 15px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-item .label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .detail-item .value {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    .product-images {
      border-top: 1px solid #eee;
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .images-count {
      color: #666;
      font-size: 14px;
    }

    .no-images {
      color: #999;
      font-size: 14px;
      font-style: italic;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 14px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-state h3 {
      color: #333;
      margin-bottom: 10px;
    }

    .empty-state p {
      color: #666;
      margin-bottom: 20px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      padding: 30px;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .modal-header h2 {
      margin: 0;
      color: #333;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
      color: #333;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private mediaService = inject(MediaService);
  private authService = inject(AuthService);

  products: Product[] = [];
  loading = true;
  showProductForm = false;
  showMediaUpload = false;
  selectedProduct?: Product;
  currentMediaList: Media[] = [];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    const userId = this.authService.currentUser()?.userId;
    if (!userId) return;

    this.productService.getProductsByUserId(userId).subscribe({
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

  openProductForm(): void {
    this.selectedProduct = undefined;
    this.showProductForm = true;
  }

  editProduct(product: Product): void {
    this.selectedProduct = product;
    this.showProductForm = true;
  }

  closeProductForm(): void {
    this.showProductForm = false;
    this.selectedProduct = undefined;
  }

  saveProduct(productData: any): void {
    if (this.selectedProduct) {
      this.productService.updateProduct(this.selectedProduct.id, productData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeProductForm();
        },
        error: (error) => {
          console.error('Error updating product:', error);
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeProductForm();
        },
        error: (error) => {
          console.error('Error creating product:', error);
        }
      });
    }
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product? This will also delete all associated images.')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  manageMedia(product: Product): void {
    this.selectedProduct = product;
    this.loadProductMedia(product.id);
    this.showMediaUpload = true;
  }

  loadProductMedia(productId: string): void {
    this.mediaService.getMediaByProductId(productId).subscribe({
      next: (media) => {
        this.currentMediaList = media;
      },
      error: (error) => {
        console.error('Error loading media:', error);
      }
    });
  }

  closeMediaUpload(): void {
    this.showMediaUpload = false;
    this.selectedProduct = undefined;
    this.currentMediaList = [];
    this.loadProducts();
  }
}
