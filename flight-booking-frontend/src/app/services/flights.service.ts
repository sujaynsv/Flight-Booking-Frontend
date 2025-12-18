import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight, FlightSearchRequest } from '../models/flight.model';
import { catchError } from 'rxjs/operators';
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
}
