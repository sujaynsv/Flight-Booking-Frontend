import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Airline {
  id: string;
  airlineName: string;
  airlineCode: string;
}

interface FlightInventoryRequest {
  airlineId: string;
  airlineName: string;
  flightNumber: string;
  fromPlace: string;
  toPlace: string;
  departureDateTime: string;
  arrivalDateTime: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  tripType: string;
}

@Component({
  selector: 'app-add-flight',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-flight.component.html'
})
export class AddFlightComponent implements OnInit {
  flightForm!: FormGroup;
  airlines: Airline[] = [];
  loadingAirlines = false;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  private airlineApi = 'http://localhost:8080/airline';
  private inventoryApi = 'http://localhost:8080/flight/airline/inventory';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.flightForm = this.fb.group({
      airlineId: ['', Validators.required],
      flightNumber: ['', Validators.required],
      fromPlace: ['', Validators.required],
      toPlace: ['', Validators.required],
      departureDateTime: ['', Validators.required],  // datetime-local string
      arrivalDateTime: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      totalSeats: [0, [Validators.required, Validators.min(1)]],
      availableSeats: [0, [Validators.required, Validators.min(0)]],
      tripType: ['ONE_WAY', Validators.required]
    });

    this.loadAirlines();
  }

  loadAirlines(): void {
    this.loadingAirlines = true;
    this.error = null;

    this.http.get<Airline[]>(this.airlineApi, { withCredentials: true }).subscribe({
      next: (data) => {
        this.airlines = data;
        this.loadingAirlines = false;
      },
      error: (err) => {
        console.error('Failed to load airlines for flight form', err);
        this.error = 'Failed to load airlines';
        this.loadingAirlines = false;
      }
    });
  }

  onSubmit(): void {
    if (this.flightForm.invalid) {
      this.error = 'Please fill all fields correctly';
      return;
    }

    this.error = null;
    this.successMessage = null;
    this.submitting = true;

    const formValue = this.flightForm.value;

    const selectedAirline = this.airlines.find(a => a.id === formValue.airlineId);
    const airlineName = selectedAirline ? selectedAirline.airlineName : '';

    const body: FlightInventoryRequest = {
      airlineId: formValue.airlineId,
      airlineName,
      flightNumber: formValue.flightNumber,
      fromPlace: formValue.fromPlace,
      toPlace: formValue.toPlace,
      departureDateTime: formValue.departureDateTime,
      arrivalDateTime: formValue.arrivalDateTime,
      price: formValue.price,
      totalSeats: formValue.totalSeats,
      availableSeats: formValue.availableSeats,
      tripType: formValue.tripType
    };

    this.http.post(this.inventoryApi, body, { withCredentials: true }).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Flight inventory created successfully';
        this.flightForm.reset({
          airlineId: '',
          tripType: 'ONE_WAY'
        });
      },
      error: (err) => {
        console.error('Failed to create flight inventory', err);
        this.submitting = false;
        this.error = err.error?.message || 'Failed to create flight';
      }
    });
  }
}
