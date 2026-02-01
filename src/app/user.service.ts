import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:5000';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  createUser(payload: { email: string; password: string }): Observable<any> {
    return this.http.post(`${BASE}/user-info`, payload);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/user-info`);
  }
}
