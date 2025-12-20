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
  userEmail = '';

  confirmingPnr: string | null = null;
  cancellingPnr: string | null = null;

  errorMessage: string | null = null;
  errorFlagFromCancelBooking = false;

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
      this.error = 'Please login to view ticket.';
    }
  }

  loadBookingHistory(): void {
    this.loading = true;
    this.bookingService.getBookingHistory(this.userEmail).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load booking history';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  askCancelConfirmation(pnr: string): void {
    this.confirmingPnr = pnr;
    this.errorFlagFromCancelBooking = false;
    this.errorMessage = null;
  }

  closeCancelConfirm(): void {
    this.confirmingPnr = null;
  }

  clearCancelError(): void {
    this.errorFlagFromCancelBooking = false;
    this.errorMessage = null;
    this.cdr.detectChanges();
  }

  confirmCancellation(pnr: string): void {
    if (this.cancellingPnr) return;

    this.cancellingPnr = pnr;

    this.bookingService.cancelBooking(pnr).subscribe({
      next: () => {
        this.cancellingPnr = null;
        this.confirmingPnr = null;
        this.loadBookingHistory();
      },
      error: (err) => {
        this.errorMessage = err.error?.message;
        this.errorFlagFromCancelBooking = true;
        this.cancellingPnr = null;
        this.confirmingPnr = null;
        this.cdr.detectChanges();
      }
    });
  }
}

  // cancelBooking(pnr: string): void {
  //   if (!confirm(`Are you sure you want to cancel booking ${pnr}?`)) {
  //     return;
  //   }

  //   this.bookingService.cancelBooking(pnr).subscribe({
  //     next: () => {
  //       alert('Booking cancelled successfully!');
  //       this.loadBookingHistory(); 
  //     },
  //     error: (err) => {
  //       console.error('Cancel error:', err);
  //       alert('Failed to cancel booking');
  //     }
  //   });
  // }

