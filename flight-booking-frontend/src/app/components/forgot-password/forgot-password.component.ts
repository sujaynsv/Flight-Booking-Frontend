import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  step: 'email' | 'code' = 'email';
  emailForm!: FormGroup;
  resetForm!: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  sendCode(): void {
    if (this.emailForm.invalid) {
      this.error = 'Please enter a valid email';
      return;
    }

    this.loading = true;
    this.error = null;
    this.email = this.emailForm.value.email;

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = response.message;
        this.step = 'code';
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to send reset code';
      }
    });
  }

  resetPassword(): void {
    if (this.resetForm.invalid) {
      if (this.resetForm.hasError('passwordMismatch')) {
        this.error = 'Passwords do not match';
      } else {
        this.error = 'Please fill all fields correctly';
      }
      return;
    }

    this.loading = true;
    this.error = null;

    const request = {
      email: this.email,
      code: this.resetForm.value.code,
      newPassword: this.resetForm.value.newPassword
    };

    this.authService.resetPassword(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = response.message;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to reset password';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}
