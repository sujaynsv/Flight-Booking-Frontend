import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required]
    });

    this.authService.authCheckComplete$.pipe(
      filter(complete => complete),
      take(1)
    ).subscribe(() => {
      if (this.authService.isLoggedIn()) {
        console.log('User already logged in, redirecting to search');
        this.router.navigate(['/search']);
      }
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.error = 'Please fill in all fields correctly';
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.loading = false;
        this.router.navigate(['/search']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.error = error.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.error = 'Please fill in all fields correctly';
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password, firstName, lastName } = this.registerForm.value;

    this.authService.register(email, password, firstName, lastName).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.loading = false;
        this.router.navigate(['/search']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.error = error.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  toggleRegister(): void {
    this.showRegister = !this.showRegister;
    this.error = null;
    this.loginForm.reset();
    this.registerForm.reset();
  }
}
