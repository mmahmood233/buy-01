import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.userServiceUrl}/api/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('current_user');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isSeller(): boolean {
    return this.currentUser()?.role === 'SELLER';
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    
    const user: User = {
      userId: response.userId,
      name: response.name,
      email: response.email,
      role: response.role,
      avatar: response.avatar
    };
    
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('current_user');
    if (userJson) {
      this.currentUser.set(JSON.parse(userJson));
    }
  }
}
