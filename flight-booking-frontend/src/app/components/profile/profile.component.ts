import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  user$ = this.authService.currentUser$;
  passwordForm!: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value 
      ? null : { mismatch: true };
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.error = 'Please fill all fields correctly';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const { currentPassword, newPassword } = this.passwordForm.value;
    
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Password changed successfully!';
        this.passwordForm.reset();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'Password change failed';
      }
    });
  }
}
