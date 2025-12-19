import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets.components.html',
})
export class TicketsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = false;
  error: string | null = null;
  userEmail: string = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    if (user?.email) {
      this.userEmail = user.email;
      this.loadBookingHistory();
    } else {
      this.error = "Please login to view ticket.";
    }
  }

  loadBookingHistory(): void {
    this.loading = true;
    this.error = null;

    this.bookingService.getBookingHistory(this.userEmail).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.loading = false;
        this.cdr.detectChanges();
        console.log('Booking history:', bookings);
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.error = 'Failed to load booking history';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelBooking(pnr: string): void {
    if (!confirm(`Are you sure you want to cancel booking ${pnr}?`)) {
      return;
    }

    this.bookingService.cancelBooking(pnr).subscribe({
      next: () => {
        alert('Booking cancelled successfully!');
        this.loadBookingHistory(); 
      },
      error: (err) => {
        console.error('Cancel error:', err);
        alert('Failed to cancel booking');
      }
    });
  }
}
