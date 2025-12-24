import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight, FlightSearchRequest } from '../models/flight.model';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private apiUrl = 'http://localhost:8080/flight';

  constructor(private http: HttpClient) {}

  searchFlights(request: FlightSearchRequest): Observable<Flight[]> {
    console.log('Searching flights:', request);
    
    return this.http.post<Flight[]>(
      `${this.apiUrl}/search`,
      request,
      { withCredentials: true }
    ).pipe(
      catchError((error) => {
        console.error(' Search failed:', error);
        return throwError(() => new Error(error.error || 'Search failed'));
      })
    );
  }

  getFlightById(id: string): Observable<Flight> {
    console.log('Getting flight details:', id);
    
    return this.http.get<Flight>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    ).pipe(
      catchError((error) => {
        console.error(' Failed to fetch flight:', error);
        return throwError(() => new Error('Failed to fetch flight'));
      })
    );
  }

  getBookedSeats(flightId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/inventory/${flightId}/booked-seats`)
      .pipe(
        map((response: any) => {
          console.log('Raw API response:', response);
          
          // The API returns a plain array
          if (Array.isArray(response)) {
            return response;
          }
          
          // Fallback if it's an object with bookedSeats property
          if (response && response.bookedSeats) {
            return response.bookedSeats;
          }
          
          // Default empty array
          return [];
        })
      );
  }


}
