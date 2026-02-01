import { Component, computed, effect, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login-form.html',
})
export class LoginFormComponent {
  // loginForm: FormGroup;
  isSubmitted = signal(false);
  isLoading = signal(false);

  email = signal('');
  password = signal('');
  logInError = signal(false);
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    // this.loginForm = this.fb.group({
    //   email: ['', [Validators.required, Validators.email]],
    //   password: ['', [Validators.required, Validators.minLength(6)]],
    // });
  }

  // get email() {
  //   return this.loginForm.get('email');
  // }

  // get password() {
  //   return this.loginForm.get('password');
  // }
  isEmailValid = computed(() => {
    return this.email().includes('@') && this.email().includes('.');
  });
  isPasswordValid = computed(() => {
    return this.password().length >= 6;
  });
  isFormValid = computed(() => {
    return this.isEmailValid() && this.isPasswordValid();
  });
  logEffect = effect(() => {
    console.log('Email:', this.email());
    console.log('Password length:', this.password().length);
  });
  onSubmit() {
    this.isSubmitted.set(true);
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading.set(true);
    const payload = { email: this.email(), password: this.password() };
    this.authService.login(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/personal-info']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.logInError.set(true);
        console.error('Login failed', err);
      },
    });
  }

  onReset() {
    // this.loginForm.reset();
    this.isSubmitted.set(false);
  }
}
