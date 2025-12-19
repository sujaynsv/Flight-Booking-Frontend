import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BookingRequest, BookingResponse, Booking} from '../models/booking.model';


@Injectable({  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/flight';
  constructor(private http: HttpClient) {}

  createBooking(flightId: string, bookingRequest:BookingRequest): Observable<BookingResponse>{
    console.log('Creating booking for flight:', flightId, bookingRequest);

    return this.http.post<BookingResponse>(
        `${this.apiUrl}/booking/${flightId}`
        , bookingRequest,{withCredentials:true});
  }

  getTicketByPnr(pnr: string): Observable<Booking>{
    console.log('Fetching ticket for PNR:', pnr);

    return this.http.get<Booking>(
        `${this.apiUrl}/ticket/${pnr}`,
        {withCredentials:true}
    )
  }


  getBookingHistory(email: string): Observable<Booking[]>{
        return this.http.get<Booking[]>(
            `${this.apiUrl}/booking/history/${email}`,
            {withCredentials:true}
        );
  }

  cancelBooking(pnr: string): Observable<{message: string}>{
    console.log('Cancelling booking for PNR:', pnr);

    return this.http.delete<{message: string}>(
        `${this.apiUrl}/booking/cancel/${pnr}`,
        {withCredentials:true}
    );
  }
}   
