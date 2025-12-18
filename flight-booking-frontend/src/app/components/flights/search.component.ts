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
  minDate: string;

  // Cities list
  cities: string[] = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Goa',
    'Kochi',
    'Lucknow',
    'Chandigarh',
    'Indore',
    'Nagpur',
    'Surat',
    'Varanasi',
    'Amritsar'
  ];

  // Filtered suggestions
  fromSuggestions: string[] = [];
  toSuggestions: string[] = [];
  
  // Show/hide suggestions
  showFromSuggestions = false;
  showToSuggestions = false;

  constructor(
    private fb: FormBuilder,
    private flightService: FlightService,
    private cdr: ChangeDetectorRef  
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      fromPlace: ['', Validators.required],
      toPlace: ['', Validators.required],
      departureDate: ['', Validators.required]
    });
  }

  // Filter cities for "From" field
  onFromInput(event: any): void {
    const value = event.target.value.toLowerCase();
    if (value.length > 0) {
      this.fromSuggestions = this.cities.filter(city => 
        city.toLowerCase().includes(value)
      );
      this.showFromSuggestions = true;
    } else {
      this.showFromSuggestions = false;
    }
  }

  // Filter cities for "To" field
  onToInput(event: any): void {
    const value = event.target.value.toLowerCase();
    if (value.length > 0) {
      this.toSuggestions = this.cities.filter(city => 
        city.toLowerCase().includes(value)
      );
      this.showToSuggestions = true;
    } else {
      this.showToSuggestions = false;
    }
  }

  // Select city from "From" suggestions
  selectFromCity(city: string): void {
    this.searchForm.patchValue({ fromPlace: city });
    this.showFromSuggestions = false;
  }

  // Select city from "To" suggestions
  selectToCity(city: string): void {
    this.searchForm.patchValue({ toPlace: city });
    this.showToSuggestions = false;
  }

  // Hide suggestions when clicking outside
  onFromBlur(): void {
    setTimeout(() => {
      this.showFromSuggestions = false;
    }, 200);
  }

  onToBlur(): void {
    setTimeout(() => {
      this.showToSuggestions = false;
    }, 200);
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
