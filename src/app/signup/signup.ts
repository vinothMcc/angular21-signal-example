import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signup.html',
})
export class SignupComponent {
  isSubmitted = signal(false);
  isLoading = signal(false);
  signUpError = signal<string | null>(null);

  email = signal('');
  password = signal('');

  isEmailValid = computed(() => this.email().includes('@') && this.email().includes('.'));
  isPasswordValid = computed(() => this.password().length >= 6);
  isFormValid = computed(() => this.isEmailValid() && this.isPasswordValid());

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    this.isSubmitted.set(true);
    this.signUpError.set(null);
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading.set(true);
    const payload = { email: this.email(), password: this.password() };

    // Create user via backend `/user-info` endpoint
    this.userService.createUser(payload).subscribe({
      next: () => {
        // On successful signup, automatically login the user
        this.authService.login(payload).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.router.navigate(['/personal-info']);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.signUpError.set(
              'Signup succeeded but automatic login failed. Please login manually.',
            );
            console.error('Login after signup failed', err);
            this.router.navigate(['/login']);
          },
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.signUpError.set(err?.error?.error || 'Failed to create user');
        console.error('Signup failed', err);
      },
    });
  }

  onReset() {
    this.isSubmitted.set(false);
    this.email.set('');
    this.password.set('');
    this.signUpError.set(null);
  }
}
