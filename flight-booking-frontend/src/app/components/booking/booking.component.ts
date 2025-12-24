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

  // Seat map properties
  seats: Seat[][] = [];
  bookedSeats: string[] = [];
  selectedSeats: string[] = [];
  currentPassengerIndex: number = -1;
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

    this.addPassenger();
    
    // Load both flight details and booked seats together
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
        console.log('Number of booked seats:', this.bookedSeats.length);
        
        // Generate seat map AFTER both are loaded
        this.generateSeatMap();
      },
      error: (err) => {
        console.error('Failed to load data:', err);
        this.error = 'Failed to load flight details';
        this.bookedSeats = [];
      }
    });
  }

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

  addPassenger(): void {
    if (this.flight?.availableSeats && this.passengers.length >= this.flight.availableSeats) {
      this.error = 'Cannot add more passengers than available seats';
      return;
    }
    this.passengers.push(this.createPassengerForm());
  }

  removePassenger(index: number): void {
    if (this.passengers.length > 1) {
      const seatNumber = this.passengers.at(index).value.seatNumber;
      if (seatNumber) {
        this.selectedSeats = this.selectedSeats.filter(s => s !== seatNumber);
      }
      this.passengers.removeAt(index);
      this.generateSeatMap();
    }
  }

  generateSeatMap(): void {
    const totalSeats = this.flight?.totalSeats;
    
    if (!totalSeats) {
      console.warn('Cannot generate seat map: flight not loaded yet');
      return;
    }

    console.log('Generating seat map');
    console.log('Total seats:', totalSeats);
    console.log('Booked seats to mark:', this.bookedSeats);
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
        
        if (isBooked) {
          console.log(`Seat ${seatNumber} is BOOKED`);
        }
        
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

  openSeatMap(passengerIndex: number): void {
    this.currentPassengerIndex = passengerIndex;
    this.showSeatMap = true;
  }

  selectSeat(seat: Seat): void {
    if (seat.isBooked) {
      console.warn('Cannot select booked seat:', seat.number);
      return;
    }

    if (this.currentPassengerIndex === -1) return;

    const currentSeat = this.passengers.at(this.currentPassengerIndex).value.seatNumber;

    // Remove old selection if exists
    if (currentSeat) {
      this.selectedSeats = this.selectedSeats.filter(s => s !== currentSeat);
    }

    // Add new selection
    this.passengers.at(this.currentPassengerIndex).patchValue({
      seatNumber: seat.number
    });

    if (!this.selectedSeats.includes(seat.number)) {
      this.selectedSeats.push(seat.number);
    }

    console.log('Seat selected:', seat.number);

    // Update seat map
    this.generateSeatMap();
    
    // Close seat map
    this.closeSeatMap();
  }

  closeSeatMap(): void {
    this.showSeatMap = false;
    this.currentPassengerIndex = -1;
  }

  hasDuplicateSeats(): boolean {
    const seatNumbers = this.passengers.controls
      .map(p => p.value.seatNumber)
      .filter(s => s && s.trim() !== '');
    
    const uniqueSeats = new Set(seatNumbers);
    return uniqueSeats.size !== seatNumbers.length;
  }

  isDuplicateSeat(seatNumber: string, currentIndex: number): boolean {
    if (!seatNumber || seatNumber.trim() === '') return false;
    
    const seatCount = this.passengers.controls.filter((p, index) => 
      index !== currentIndex && 
      p.value.seatNumber && 
      p.value.seatNumber.toUpperCase() === seatNumber.toUpperCase()
    ).length;
    
    return seatCount > 0;
  }

  onSeatChange(index: number): void {
    const seatNumber = this.passengers.at(index).value.seatNumber;
    
    if (this.isDuplicateSeat(seatNumber, index)) {
      this.error = `Seat ${seatNumber} is already selected for another passenger`;
    } else if (this.error && this.error.includes('already selected')) {
      this.error = null;
    }
    
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.error = 'Please fill all fields correctly';
      this.bookingForm.markAllAsTouched();
      return;
    }

    if (this.hasDuplicateSeats()) {
      this.error = 'Duplicate seat numbers are not allowed. Each passenger must have a unique seat.';
      this.cdr.detectChanges();
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
