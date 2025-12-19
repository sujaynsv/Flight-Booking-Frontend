import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService } from '../../services/flights.service';
import { BookingService } from '../../services/booking.service';
import { Flight } from '../../models/flight.model';
import { BookingRequest } from '../../models/booking.model';
import {ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking.component.html',
//   styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  bookingForm!: FormGroup;
  flight: Flight | null = null;
  flightId: string = '';
  loading = false;
  error: string | null = null;
  pnr: string | null=null;
  successMessage: string | null=null;
  flag: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.flightId = this.route.snapshot.paramMap.get('flightId') || '';
    
    this.bookingForm = this.fb.group({
      name: ['Sujay', Validators.required],
      email: ['sujaynsv@gmail.com', [Validators.required, Validators.email]],
      gender: ['MALE', Validators.required],
      mealPreference: ['VEG', Validators.required],
      passengerName: ['Sujay', Validators.required],
      age: ['18', [Validators.required, Validators.min(1)]],
      seatNumber: ['A1', Validators.required]
    });


    this.loadFlightDetails();
  }

  loadFlightDetails(): void {
    this.flightService.getFlightById(this.flightId).subscribe({
      next: (flight) => {
        this.flight = flight;
        console.log('Flight loaded:', flight);
      },
      error: (err) => {
        this.error = 'Failed to load flight details';
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.error = 'Please fill all fields displayed in the html';
      console.log(this.bookingForm.value);
      return;
    }

    this.error=null;
    this.successMessage=null;

    this.loading = true;

    const bookingRequest: BookingRequest = {
      name: this.bookingForm.value.name,
      email: this.bookingForm.value.email,
      numberOfSeats: 1,
      passengers: [
        {
          name: this.bookingForm.value.passengerName,
          gender: this.bookingForm.value.gender,
          age: this.bookingForm.value.age,
          mealPreference: this.bookingForm.value.mealPreference
        }
      ],
      seatNumbers: [this.bookingForm.value.seatNumber]
    };

    console.log('Sending booking:', bookingRequest);

    this.bookingService.createBooking(this.flightId, bookingRequest).subscribe({
      next: (response) => {
        console.log("Reaching here to book");
        this.flag=true;
        console.log(this.flag);
        this.loading=false;
        this.pnr=response.pnr;
        this.successMessage="booking Success";
        this.cdr.detectChanges();

      },
      error: (err) => {
        this.error = 'Booking failed: ' + (err.error?.message || 'Unknown error');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/search']);
  }
}
