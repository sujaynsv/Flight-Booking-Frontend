import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { filter, take } from 'rxjs/operators';
import { strongPasswordValidator } from '../../validators/password-validator';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  showRegister = false;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['USER', Validators.required]
    });

    this.authService.authCheckComplete$.pipe(
      filter(complete => complete),
      take(1)
    ).subscribe(() => {
      const user = this.authService.getCurrentUserValue();
      if (user) {
        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/search']);
        }
      }
    });
  }
    getPasswordErrors(): string[] {
    const errors: string[] = [];
    const passwordControl = this.registerForm.get('password');
    
    if (passwordControl?.errors && passwordControl.touched) {
      const strongPasswordError = passwordControl.errors['strongPassword'];
      
      if (strongPasswordError) {
        if (!strongPasswordError.hasMinLength) {
          errors.push('At least 12 characters');
        }
        if (!strongPasswordError.hasLowerCase) {
          errors.push('At least one lowercase letter');
        }
        if (!strongPasswordError.hasUpperCase) {
          errors.push('At least one uppercase letter');
        }
        if (!strongPasswordError.hasNumber) {
          errors.push('At least one number');
        }
      }
    }
    
    return errors;
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.error = 'Please fill in all fields correctly';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (user) => {
        console.log('Login successful', user);
        this.loading = false;
        this.cdr.detectChanges();

        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/search']);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;
        
        const errorMessage = error.message || 'Login failed. Please try again.';
        
        // ← CHECK IF PASSWORD EXPIRED
        if (errorMessage.includes('Password has expired') || 
            errorMessage.includes('expired')) {
          
          // Store email for password reset
          localStorage.setItem('passwordResetEmail', email);
          
          // Redirect to change password page
          this.router.navigate(['/change-password'], {
            queryParams: { expired: true }
          });
        } else {
          // Show normal error
          this.error = errorMessage;
          this.cdr.detectChanges();
        }
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.error = 'Please fill in all fields correctly';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    const { email, password, firstName, lastName, role } = this.registerForm.value;

    this.authService.register(email, password, firstName, lastName, role).subscribe({
      next: (user) => {
        console.log('Registration successful', user);
        this.loading = false;
        this.cdr.detectChanges();

        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/search']);
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.error = error.message || 'Registration failed. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleRegister(): void {
    this.showRegister = !this.showRegister;
    this.error = null;
    this.loginForm.reset();
    this.registerForm.reset();
    this.registerForm.patchValue({role: 'USER'});
    this.cdr.detectChanges();
  }
}
