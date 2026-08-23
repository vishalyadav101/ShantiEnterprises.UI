import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  AuthService,
  LoginRequest
} from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading = false;
  errorMessage = '';

  loginForm = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6)
      ]
    ]
  });

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  onSubmit(): void {

    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const request: LoginRequest =
      this.loginForm.getRawValue();

    this.isLoading = true;

    this.authService
      .login(request)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({

        next: (response) => {

          console.log('LOGIN SUCCESS:', response);

          console.log(
            'TOKEN:',
            localStorage.getItem('token')
          );

          console.log(
            'USER:',
            localStorage.getItem('user')
          );

          if (
            response.role?.toLowerCase() === 'admin'
          ) {
            this.router.navigate(['/admin']);
          }
          else {
            this.router.navigate(['/home']);
          }
        },

        error: (error) => {

          console.error(
            'LOGIN ERROR:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Invalid email or password.';
        }

      });
  }
}