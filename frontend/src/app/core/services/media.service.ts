import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Media } from '../models/media.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private readonly API_URL = `${environment.mediaServiceUrl}/api/media`;

  constructor(private http: HttpClient) {}

  uploadMedia(file: File, productId: string): Observable<Media> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', productId);
    
    return this.http.post<Media>(`${this.API_URL}/upload`, formData);
  }

  getMediaByProductId(productId: string): Observable<Media[]> {
    return this.http.get<Media[]>(`${this.API_URL}/product/${productId}`);
  }

  deleteMedia(mediaId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${mediaId}`);
  }
}
