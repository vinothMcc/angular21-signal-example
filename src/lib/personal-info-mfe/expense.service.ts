import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:5000';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  constructor(private http: HttpClient) {}

  getExpenses(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/expenses`);
  }

  createExpense(payload: { category: string; date: string; price: number; notes?: string }): Observable<any> {
    return this.http.post(`${BASE}/expenses`, payload);
  }
}
