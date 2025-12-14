import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface AuthUser {
  email: string;
  firstname: string;
  lastname: string;
  role?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/auth';  
  
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    this.http.get<AuthUser>(`${this.apiUrl}/me`, {
      withCredentials: true
    }).subscribe(
      (user) => {
        console.log(' User already logged in:', user.email);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      },
      () => {
        console.log('🚪 User not logged in');
        this.currentUserSubject.next(null);
        this.isLoggedInSubject.next(false);
      }
    );
  }

  login(email: string, password: string): Observable<AuthUser> {
    console.log('🔐 Logging in:', email);
    
    return this.http.post<AuthUser>(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        console.log(' Login successful', response);
        this.currentUserSubject.next(response);
        this.isLoggedInSubject.next(true);
      }),
      catchError((error) => {
        console.error(' Login failed:', error);
        const errorMessage = error?.error?.message || 'Login failed';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  register(email: string, password: string, firstName: string, lastName: string): Observable<AuthUser> {
    console.log('🔐 Registering:', email);
    
    return this.http.post<AuthUser>(
      `${this.apiUrl}/register`,
      { email, password, firstName, lastName },
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        console.log(' Registration successful', response);
        this.currentUserSubject.next(response);
        this.isLoggedInSubject.next(true);
      }),
      catchError((error) => {
        console.error(' Registration failed:', error);
        const errorMessage = error?.error?.message || 'Registration failed';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): Observable<any> {
    console.log('🚪 Logging out');
    
    return this.http.post<any>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        console.log(' Logged out');
        this.currentUserSubject.next(null);
        this.isLoggedInSubject.next(false);
      }),
      catchError((error) => {
        console.error(' Logout failed:', error);
        this.currentUserSubject.next(null);
        this.isLoggedInSubject.next(false);
        return throwError(() => new Error('Logout failed'));
      })
    );
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}
