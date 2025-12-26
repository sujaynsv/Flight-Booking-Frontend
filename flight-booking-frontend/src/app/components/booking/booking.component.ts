import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService } from '../../services/flights.service';
import { BookingService } from '../../services/booking.service';
import { Flight } from '../../models/flight.model';
import { BookingRequest } from '../../models/booking.model';
import { ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';

interface Seat {
  number: string;
  isBooked: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  bookingForm!: FormGroup;
  flight: Flight | null = null;
  flightId: string = '';
  loading = false;
  error: string | null = null;
  pnr: string | null = null;
  successMessage: string | null = null;
  flag: boolean = false;

  currentStep: number = 1; 
  numberOfPassengers: number = 1;

  seats: Seat[][] = [];
  bookedSeats: string[] = [];
  selectedSeats: string[] = [];
  showSeatMap: boolean = false;

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
      passengers: this.fb.array([])
    });
    
    this.loadFlightDataAndSeats();
  }

  loadFlightDataAndSeats(): void {
    console.log('Loading flight data and booked seats...');
    
    forkJoin({
      flight: this.flightService.getFlightById(this.flightId),
      bookedSeats: this.flightService.getBookedSeats(this.flightId)
    }).subscribe({
      next: (result) => {
        this.flight = result.flight;
        this.bookedSeats = result.bookedSeats;
        
        console.log('Flight loaded:', this.flight);
        console.log('Booked seats loaded:', this.bookedSeats);
        
        // Generate seat map
        this.generateSeatMap();
      },
      error: (err) => {
        console.error('Failed to load data:', err);
        this.error = 'Failed to load flight details';
        this.bookedSeats = [];
      }
    });
  }

  // Step 1: Set number of passengers
  setNumberOfPassengers(count: number): void {
    if (this.flight && count > this.flight.availableSeats) {
      this.error = `Only ${this.flight.availableSeats} seats available`;
      return;
    }
    this.numberOfPassengers = count;
    this.error = null;
  }

  goToSeatSelection(): void {
    if (this.numberOfPassengers < 1) {
      this.error = 'Please select at least 1 passenger';
      return;
    }
    this.currentStep = 2;
    this.showSeatMap = true;
  }

  // Step 2: Select seats
  generateSeatMap(): void {
    const totalSeats = this.flight?.totalSeats;
    
    if (!totalSeats) {
      console.warn('Cannot generate seat map: flight not loaded yet');
      return;
    }

    console.log('Generating seat map');
    console.log('Total seats:', totalSeats);
    console.log('Booked seats:', this.bookedSeats);
    console.log('Selected seats:', this.selectedSeats);

    const seatsPerRow = 6;
    const rows = Math.ceil(totalSeats / seatsPerRow);
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

    this.seats = [];
    let seatCount = 0;

    for (let row = 1; row <= rows && seatCount < totalSeats; row++) {
      const rowSeats: Seat[] = [];
      for (let col = 0; col < seatsPerRow && seatCount < totalSeats; col++) {
        const seatNumber = columns[col] + row;
        const isBooked = this.bookedSeats.includes(seatNumber);
        const isSelected = this.selectedSeats.includes(seatNumber);
        
        rowSeats.push({
          number: seatNumber,
          isBooked: isBooked,
          isSelected: isSelected
        });
        seatCount++;
      }
      this.seats.push(rowSeats);
    }
    
    console.log('Seat map generated:', this.seats.length, 'rows');
  }

  selectSeat(seat: Seat): void {
    if (seat.isBooked) {
      console.warn('Cannot select booked seat:', seat.number);
      return;
    }

    // Check if already selected
    const index = this.selectedSeats.indexOf(seat.number);
    
    if (index > -1) {
      // Deselect
      this.selectedSeats.splice(index, 1);
    } else {
      // Select only if under limit
      if (this.selectedSeats.length >= this.numberOfPassengers) {
        this.error = `You can only select ${this.numberOfPassengers} seat(s)`;
        return;
      }
      this.selectedSeats.push(seat.number);
      this.error = null;
    }

    console.log('Selected seats:', this.selectedSeats);
    this.generateSeatMap();
  }

  canProceedToPassengerDetails(): boolean {
    return this.selectedSeats.length === this.numberOfPassengers;
  }

  goToPassengerDetails(): void {
    if (!this.canProceedToPassengerDetails()) {
      this.error = `Please select exactly ${this.numberOfPassengers} seat(s)`;
      return;
    }

    // Create passenger forms for each selected seat
    this.passengers.clear();
    this.selectedSeats.forEach((seatNumber) => {
      const passengerForm = this.createPassengerForm();
      passengerForm.patchValue({ seatNumber: seatNumber });
      this.passengers.push(passengerForm);
    });

    this.currentStep = 3;
    this.showSeatMap = false;
  }

  backToSeatSelection(): void {
    this.currentStep = 2;
    this.showSeatMap = true;
  }

  backToPassengerCount(): void {
    this.currentStep = 1;
    this.selectedSeats = [];
    this.passengers.clear();
    this.generateSeatMap();
  }

  closeSeatMap(): void {
    if (this.currentStep === 2) {
      this.currentStep = 1;
    }
    this.showSeatMap = false;
  }

  // Step 3: Fill passenger details
  createPassengerForm(): FormGroup { 
    return this.fb.group({
      passengerName: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      mealPreference: ['', Validators.required],
      gender: ['', Validators.required],
      seatNumber: ['', Validators.required]
    });
  }
  
  get passengers(): FormArray {
    return this.bookingForm.get('passengers') as FormArray;
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.error = 'Please fill all fields correctly';
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.error = null;
    this.successMessage = null;
    this.loading = true;

    const passengerData = this.passengers.controls.map(passenger => ({
      name: passenger.value.passengerName,
      gender: passenger.value.gender,
      age: passenger.value.age,
      mealPreference: passenger.value.mealPreference
    }));

    const seatNumbers = this.passengers.controls.map(
      passenger => passenger.value.seatNumber
    );

    const bookingRequest: BookingRequest = {
      name: this.bookingForm.value.name,
      email: this.bookingForm.value.email,
      numberOfSeats: this.passengers.length,
      passengers: passengerData,
      seatNumbers: seatNumbers
    };

    console.log('Sending booking:', bookingRequest);

    this.bookingService.createBooking(this.flightId, bookingRequest).subscribe({
      next: (response) => {
        console.log("Booking successful");
        this.flag = true;
        this.loading = false;
        this.pnr = response.pnr;
        this.successMessage = "Booking Success";
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Booking failed: ' + (err.error?.message || err.error?.error || 'Unknown error');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/search']);
  }
}
