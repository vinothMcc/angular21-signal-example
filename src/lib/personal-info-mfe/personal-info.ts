import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-info.html',
})
export class PersonalInfoComponent {
  personalForm: FormGroup;
  isSubmitted = signal(false);
  isLoading = signal(false);

  constructor(private fb: FormBuilder, private router: Router) {
    this.personalForm = this.fb.group({
      category: ['', Validators.required],
      date: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      notes: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  get category() {
    return this.personalForm.get('category');
  }

  get date() {
    return this.personalForm.get('date');
  }

  get price() {
    return this.personalForm.get('price');
  }

  get notes() {
    return this.personalForm.get('notes');
  }

  onSubmit() {
    this.isSubmitted.set(true);

    if (this.personalForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    console.log('Personal Info Submitted:', this.personalForm.value);

    setTimeout(() => {
      this.isLoading.set(false);
      this.personalForm.reset();
      this.isSubmitted.set(false);
      alert('Information saved successfully!');
    }, 1500);
  }

  onReset() {
    this.personalForm.reset();
    this.isSubmitted.set(false);
  }

  onLogout() {
    this.router.navigate(['/login']);
  }
}
