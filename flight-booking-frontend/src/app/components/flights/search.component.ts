import { Component, OnInit, ChangeDetectorRef } from '@angular/core';  
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FlightService } from '../../services/flights.service';
import { Flight, FlightSearchRequest } from '../../models/flight.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchForm!: FormGroup;
  flights: Flight[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private flightService: FlightService,
    private cdr: ChangeDetectorRef  
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      fromPlace: ['', Validators.required],
      toPlace: ['', Validators.required],
      departureDate: ['', Validators.required]
    });
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = null;
    this.flights = [];

    const searchRequest: FlightSearchRequest = {
      fromPlace: this.searchForm.value.fromPlace,
      toPlace: this.searchForm.value.toPlace,
      departureDate: this.searchForm.value.departureDate,
      tripType: 'ONE_WAY'
    };

    console.log('Sending to backend:', searchRequest);

    this.flightService.searchFlights(searchRequest).subscribe({
      next: (flights) => {
        console.log('Found flights:', flights);
        this.flights = [...flights];
        this.loading = false;
        this.cdr.detectChanges();     
      },
      error: (error) => {
        console.error('Search error:', error);
        this.error = error.message || 'Failed to search flights';
        this.loading = false;
        this.cdr.detectChanges();     
      }
    });
  }
}
