import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../../core/services/media.service';
import { Media } from '../../../core/models/media.model';

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="media-upload-container">
      <h3>Product Images</h3>

      @if (errorMessage) {
        <div class="alert alert-error">{{ errorMessage }}</div>
      }

      @if (successMessage) {
        <div class="alert alert-success">{{ successMessage }}</div>
      }

      <div class="upload-section">
        <input 
          type="file" 
          #fileInput 
          (change)="onFileSelected($event)" 
          accept="image/jpeg,image/png,image/gif,image/webp"
          style="display: none">
        
        <button 
          type="button" 
          class="btn btn-primary" 
          (click)="fileInput.click()"
          [disabled]="uploading">
          {{ uploading ? 'Uploading...' : 'Upload Image' }}
        </button>
        
        <p class="upload-info">Max size: 2MB. Allowed: JPEG, PNG, GIF, WebP</p>
      </div>

      @if (mediaList.length > 0) {
        <div class="media-grid">
          @for (media of mediaList; track media.id) {
            <div class="media-item">
              <img [src]="getImageUrl(media)" [alt]="media.fileName">
              <div class="media-overlay">
                <button 
                  type="button" 
                  class="btn btn-danger btn-sm" 
                  (click)="onDeleteMedia(media.id)">
                  Delete
                </button>
              </div>
              <div class="media-info">
                <small>{{ formatFileSize(media.fileSize) }}</small>
              </div>
            </div>
          }
        </div>
      } @else {
        <p class="no-media">No images uploaded yet</p>
      }
    </div>
  `,
  styles: [`
    .media-upload-container {
      margin-top: 20px;
    }

    h3 {
      margin-bottom: 15px;
      color: #333;
    }

    .upload-section {
      margin-bottom: 20px;
    }

    .upload-info {
      margin-top: 10px;
      color: #666;
      font-size: 14px;
    }

    .media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }

    .media-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .media-item img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      display: block;
    }

    .media-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .media-item:hover .media-overlay {
      opacity: 1;
    }

    .media-info {
      padding: 8px;
      background: white;
      text-align: center;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .no-media {
      text-align: center;
      color: #666;
      padding: 40px;
      background: #f5f5f5;
      border-radius: 8px;
    }
  `]
})
export class MediaUploadComponent {
  @Input() productId!: string;
  @Input() mediaList: Media[] = [];
  @Output() mediaUploaded = new EventEmitter<void>();
  @Output() mediaDeleted = new EventEmitter<void>();

  private mediaService = inject(MediaService);

  uploading = false;
  errorMessage = '';
  successMessage = '';

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    
    if (!file) return;

    if (file.size > 2097152) {
      this.errorMessage = 'File size exceeds 2MB limit';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed';
      return;
    }

    this.uploadFile(file);
  }

  uploadFile(file: File): void {
    this.uploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.mediaService.uploadMedia(file, this.productId).subscribe({
      next: () => {
        this.successMessage = 'Image uploaded successfully';
        this.uploading = false;
        this.mediaUploaded.emit();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to upload image';
        this.uploading = false;
      }
    });
  }

  onDeleteMedia(mediaId: string): void {
    if (confirm('Are you sure you want to delete this image?')) {
      this.mediaService.deleteMedia(mediaId).subscribe({
        next: () => {
          this.successMessage = 'Image deleted successfully';
          this.mediaDeleted.emit();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete image';
        }
      });
    }
  }

  getImageUrl(media: Media): string {
    return `http://localhost:8083${media.imagePath}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
