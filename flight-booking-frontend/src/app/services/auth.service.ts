import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';   // ← add map here
import { AuthResponse, RegisterRequest } from '../models/auth.model';

interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private authCheckComplete = new BehaviorSubject<boolean>(false);
  authCheckComplete$ = this.authCheckComplete.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    this.http.get<AuthResponse>(`${this.apiUrl}/me`, {
      withCredentials: true
    }).subscribe({
      next: (res) => {
        console.log('User already logged in response:', res);
        const user: AuthUser = {
          email: res.email,
          firstName: res.firstname,
          lastName: res.lastname,
          role: res.role,
          message: res.message
        };
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
        this.authCheckComplete.next(true);
      },
      error: () => {
        console.log('User not logged in');
        this.currentUserSubject.next(null);
        this.isLoggedInSubject.next(false);
        this.authCheckComplete.next(true);
      }
    });
  }

  login(email: string, password: string): Observable<AuthUser> {
    console.log('Logging in:', email);
    
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap((res) => {
        console.log('Login successful', res);
        const user: AuthUser = {
          email: res.email,
          firstName: res.firstname,
          lastName: res.lastname,
          role: res.role,
          message: res.message
        };
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      }),
      map((res): AuthUser => ({
        email: res.email,
        firstName: res.firstname,
        lastName: res.lastname,
        role: res.role,
        message: res.message
      })),
      catchError((error) => {
        console.error('Login failed:', error);
        const errorMessage = error?.error?.message || 'Login failed';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string
  ): Observable<AuthUser> {
    console.log('Registering:', email);

    const body: RegisterRequest = { email, password, firstName, lastName, role };

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register`,
      body,
      { withCredentials: true }
    ).pipe(
      tap((res) => {
        const user: AuthUser = {
          email: res.email,
          firstName: res.firstname,
          lastName: res.lastname,
          role: res.role,
          message: res.message
        };
        console.log('Registration successful', user);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      }),
      map((res): AuthUser => ({
        email: res.email,
        firstName: res.firstname,
        lastName: res.lastname,
        role: res.role,
        message: res.message
      })),
      catchError((error) => {
        console.error('Registration failed:', error);
        const errorMessage = error?.error?.message || 'Registration failed';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): Observable<any> {
    console.log('Logging out');
    
    return this.http.post<any>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        console.log('Logout successful');
        this.currentUserSubject.next(null);
        this.isLoggedInSubject.next(false);
      }),
      catchError((error) => {
        console.error('Logout failed:', error);
        this.currentUserSubject.next(null);
        this.isLoggedInSubject.next(false);
        return throwError(() => new Error('Logout failed'));
      })
    );
  }

  getCurrentUser(): Observable<AuthUser | null> {
    return this.currentUser$;
  }

  getCurrentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

changePassword(currentPassword: string, newPassword: string): Observable<any> {
  return this.http.patch<any>(
    `${this.apiUrl}/password`,
    { currentPassword, newPassword },
    { withCredentials: true }
  ).pipe(
    map((response: any) => {
      console.log('Password changed successfully:', response.message);
      return response;
    }),
    catchError((error) => {
      console.error('Password change failed:', error);
      const errorMessage = error?.error?.message || 'Password change failed';
      return throwError(() => new Error(errorMessage));
    })
  );
}


}

