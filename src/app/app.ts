import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Daily Expense Tracker');

  // Example data used in the demo template below.
  // Keep this simple — in a real app you'd fetch this from an API.
  sampleItems = signal<string[]>(['Groceries', 'Rent', 'Utilities']);

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  // Check whether a token exists (simple local check).
  isAuth() {
    return this.auth.isAuthenticated();
  }

  // Perform logout: clear stored token and redirect to login page.
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
