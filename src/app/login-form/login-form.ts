import { Component, computed, effect, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.html',
})
export class LoginFormComponent {
  // loginForm: FormGroup;
  isSubmitted = signal(false);
  isLoading = signal(false);

  email = signal('');
  password = signal('');
  logInError = signal(false);
  constructor(private fb: FormBuilder, private router: Router) {
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
    setTimeout(() => {
      this.router.navigate(['/personal-info']);
    }, 1500);
  }

  onReset() {
    // this.loginForm.reset();
    this.isSubmitted.set(false);
  }
}
