import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2>{{ isEditMode ? 'Edit Product' : 'Create Product' }}</h2>

        @if (errorMessage) {
          <div class="alert alert-error">{{ errorMessage }}</div>
        }

        <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Product Name *</label>
            <input 
              type="text" 
              id="name" 
              formControlName="name" 
              class="form-control"
              placeholder="Enter product name">
            @if (productForm.get('name')?.invalid && productForm.get('name')?.touched) {
              <div class="error">Product name must be between 3 and 200 characters</div>
            }
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea 
              id="description" 
              formControlName="description" 
              class="form-control"
              rows="4"
              placeholder="Enter product description"></textarea>
            @if (productForm.get('description')?.invalid && productForm.get('description')?.touched) {
              <div class="error">Description must be between 10 and 2000 characters</div>
            }
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="price">Price *</label>
              <input 
                type="number" 
                id="price" 
                formControlName="price" 
                class="form-control"
                step="0.01"
                placeholder="0.00">
              @if (productForm.get('price')?.invalid && productForm.get('price')?.touched) {
                <div class="error">Price must be greater than 0</div>
              }
            </div>

            <div class="form-group">
              <label for="quantity">Quantity *</label>
              <input 
                type="number" 
                id="quantity" 
                formControlName="quantity" 
                class="form-control"
                placeholder="0">
              @if (productForm.get('quantity')?.invalid && productForm.get('quantity')?.touched) {
                <div class="error">Quantity cannot be negative</div>
              }
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid || loading">
              {{ loading ? 'Saving...' : 'Save Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
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
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    h2 {
      margin-bottom: 20px;
      color: #333;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    textarea {
      resize: vertical;
    }
  `]
})
export class ProductFormComponent implements OnInit {
  @Input() product?: Product;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  productForm!: FormGroup;
  loading = false;
  errorMessage = '';

  get isEditMode(): boolean {
    return !!this.product;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: [this.product?.name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: [this.product?.description || '', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      price: [this.product?.price || '', [Validators.required, Validators.min(0.01)]],
      quantity: [this.product?.quantity || 0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.save.emit(this.productForm.value);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
