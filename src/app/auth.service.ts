import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const BASE = 'http://localhost:5000';

// AuthService: handles authentication requests and token handling.
// - `login` exchanges credentials for an access_token which is stored in localStorage under 'token'.
// - `logout` removes the stored token.
// - `getProfile` calls the protected `/me` endpoint to retrieve current user data.
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post(`${BASE}/login`, payload).pipe(
      tap((res: any) => {
        if (res?.access_token) {
          localStorage.setItem('token', res.access_token);
        }
      }),
    );
  }

  logout() {
    localStorage.removeItem('token');
  }

  getProfile(): Observable<any> {
    return this.http.get(`${BASE}/me`);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
