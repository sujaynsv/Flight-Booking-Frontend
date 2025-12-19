import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
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
  styleUrls: ['./booking.component.css']
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
      passengers:this.fb.array([])
    });

    this.addPassenger();
    this.loadFlightDetails();
  }

  createPassengerForm(): FormGroup{ 
    return this.fb.group({
        passengerName:['', Validators.required],
        age:['', Validators.required],
        mealPreference:['',Validators.required],
        gender:['',Validators.required],
        seatNumber:['',Validators.required]
    })
  }
  
  get passengers(): FormArray{
    return this.bookingForm.get('passengers') as FormArray
  }

  addPassenger(): void{
    this.passengers.push(this.createPassengerForm());
  }

  removePassenger(index: number) : void{
    if(this.passengers.length>1){
        this.passengers.removeAt(index);
    }
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
      this.bookingForm.markAllAsTouched();
      console.log(this.bookingForm.value);
      return;
    }

    this.error=null;
    this.successMessage=null;

    this.loading = true;

    const passengerData= this.passengers.controls.map(passenger=>({
        name:passenger.value.passengerName,
        gender:passenger.value.gender,
        age:passenger.value.age,
        mealPreference:passenger.value.mealPreference
    }))

    const seatNumbers=this.passengers.controls.map(
        passenger=>passenger.value.seatNumber
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
