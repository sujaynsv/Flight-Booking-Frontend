import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  isExpired = false;
  userEmail: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if redirected due to expired password
    this.route.queryParams.subscribe(params => {
      if (params['expired'] === 'true') {
        this.isExpired = true;
        this.userEmail = localStorage.getItem('passwordResetEmail');
        this.error = 'Your password has expired. Please change it to continue.';
      }
    });
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.error = 'Please fill all fields correctly';
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.error = 'New passwords do not match';
      return;
    }

    if (newPassword === currentPassword) {
      this.error = 'New password must be different from current password';
      return;
    }

    this.loading = true;
    this.error = null;

    // ← USE DIFFERENT METHOD BASED ON isExpired
    if (this.isExpired && this.userEmail) {
      // Unauthenticated password reset (for expired passwords)
      this.authService.resetPasswordWithCredentials(
        this.userEmail, 
        currentPassword, 
        newPassword
      ).subscribe({
        next: (response) => {
          this.success = 'Password changed successfully! Redirecting to login...';
          this.loading = false;
          
          // Clear stored email
          localStorage.removeItem('passwordResetEmail');
          
          // Redirect to login
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Password reset failed';
          this.loading = false;
        }
      });
    } else {
      // Authenticated password change (original method)
      this.authService.changePassword(currentPassword, newPassword).subscribe({
        next: (response) => {
          this.success = 'Password changed successfully!';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/search']), 2000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Password change failed';
          this.loading = false;
        }
      });
    }
  }

  goToLogin(): void {
    localStorage.removeItem('passwordResetEmail');
    this.router.navigate(['/login']);
  }
}
