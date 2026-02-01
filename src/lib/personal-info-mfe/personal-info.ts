import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../app/user.service';
import { ExpenseService } from './expense.service';

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
  users = signal<any[]>([]);
  expenses = signal<any[]>([]);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private expenseService: ExpenseService,
  ) {
    this.personalForm = this.fb.group({
      category: ['', Validators.required],
      date: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      notes: ['', [Validators.required, Validators.minLength(10)]],
    });

    // load users from backend
    this.userService.getUsers().subscribe({
      next: (users) => this.users.set(users),
      error: (err) => console.error('Failed to load users', err),
    });

    // load expenses
    this.loadExpenses();
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
    const payload = {
      category: this.category?.value,
      date: this.date?.value,
      price: parseFloat(this.price?.value),
      notes: this.notes?.value,
    };

    this.expenseService.createExpense(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.personalForm.reset();
        this.isSubmitted.set(false);
        alert('Information saved successfully!');
        this.loadExpenses();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Failed to save expense', err);
        alert('Failed to save expense');
      },
    });
  }

  private loadExpenses() {
    this.expenseService.getExpenses().subscribe({
      next: (list) => this.expenses.set(list),
      error: (err) => console.error('Failed to load expenses', err),
    });
  }

  onReset() {
    this.personalForm.reset();
    this.isSubmitted.set(false);
  }

  onLogout() {
    this.router.navigate(['/login']);
  }
}
