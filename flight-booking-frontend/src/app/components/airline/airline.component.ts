import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Airline {
  id?: string;
  airlineName: string;
  airlineCode: string;
  contactEmail: string;
  contactPhone: string;
}

@Component({
  selector: 'app-airline',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './airline.component.html'
})
export class AirlineComponent implements OnInit {
  airlineForm!: FormGroup;
  airlines: Airline[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  private apiUrl = 'http://localhost:8080/airline';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.airlineForm = this.fb.group({
      airlineName: ['', Validators.required],
      airlineCode: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', Validators.required]
    });

    this.loadAirlines();
  }

  loadAirlines(): void {
    this.loading = true;
    this.error = null;

    this.http.get<Airline[]>(this.apiUrl, { withCredentials: true }).subscribe({
      next: (data) => {
        console.log('Airlines loaded', data);
        this.airlines = data;
        this.loading = false;        // <- make sure this is here
      },
      error: (err) => {
        console.error('Failed to load airlines', err);
        this.error = 'Failed to load airlines';
        this.loading = false;        // <- and here
      }
    });
  }

  onSubmit(): void {
    if (this.airlineForm.invalid) {
      this.error = 'Please fill all fields correctly';
      return;
    }

    this.error = null;
    this.successMessage = null;

    const body: Airline = this.airlineForm.value;

    this.http.post<Airline>(this.apiUrl, body, { withCredentials: true }).subscribe({
      next: () => {
        this.successMessage = 'Airline created successfully';
        this.airlineForm.reset();
        this.loadAirlines();   // reload list
      },
      error: (err) => {
        console.error('Failed to create airline', err);
        this.error = err.error?.error || 'Failed to create airline';
      }
    });
  }
}
