import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets.components.html',
  styleUrls: ['./ticket.component.css']
})
export class TicketsComponent implements OnInit {
  bookings: any[] = [];
  filteredBookings: any[] = [];
  userEmail: string = '';
  loading: boolean = true;
  error: string | null = null;
  
  // Filter state - Added COMPLETED
  selectedFilter: 'ALL' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' = 'ALL';
  
  // Cancellation state
  confirmingPnr: string | null = null;
  cancellingPnr: string | null = null;
  errorFlagFromCancelBooking: boolean = false;
  errorMessage: string = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get user email from auth service
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user?.email) {
          this.userEmail = user.email;
          this.loadBookings();
        } else {
          this.error = 'User not logged in';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Failed to get user:', err);
        this.error = 'Failed to get user information';
        this.loading = false;
      }
    });
  }

  loadBookings(): void {
    this.loading = true;
    this.error = null;

    this.bookingService.getBookingHistory(this.userEmail).subscribe({
      next: (bookings) => {
        console.log('Bookings loaded:', bookings);
        this.bookings = bookings;
        this.applyFilter(); // Apply filter after loading
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
        this.error = 'Failed to load bookings';
        this.loading = false;
      }
    });
  }

  // Check if booking journey date has passed
  isBookingCompleted(journeyDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day
    
    const journey = new Date(journeyDate);
    journey.setHours(0, 0, 0, 0); // Reset to start of day
    
    return journey < today;
  }

  // Get effective status (includes COMPLETED for past dates)
  getEffectiveStatus(booking: any): string {
    if (booking.status === 'CONFIRMED' && this.isBookingCompleted(booking.journeyDate)) {
      return 'COMPLETED';
    }
    return booking.status;
  }

  // Filter methods
  setFilter(filter: 'ALL' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedFilter === 'ALL') {
      this.filteredBookings = this.bookings;
    } else if (this.selectedFilter === 'CONFIRMED') {
      // Show only upcoming confirmed bookings
      this.filteredBookings = this.bookings.filter(
        booking => booking.status === 'CONFIRMED' && !this.isBookingCompleted(booking.journeyDate)
      );
    } else if (this.selectedFilter === 'CANCELLED') {
      this.filteredBookings = this.bookings.filter(
        booking => booking.status === 'CANCELLED'
      );
    } else if (this.selectedFilter === 'COMPLETED') {
      // Show completed bookings (confirmed + past date)
      this.filteredBookings = this.bookings.filter(
        booking => booking.status === 'CONFIRMED' && this.isBookingCompleted(booking.journeyDate)
      );
    }
    console.log('Filtered bookings:', this.filteredBookings);
  }

  getTotalCount(): number {
    return this.bookings.length;
  }

  getConfirmedCount(): number {
    // Only upcoming confirmed bookings
    return this.bookings.filter(b => 
      b.status === 'CONFIRMED' && !this.isBookingCompleted(b.journeyDate)
    ).length;
  }

  getCancelledCount(): number {
    return this.bookings.filter(b => b.status === 'CANCELLED').length;
  }

  getCompletedCount(): number {
    return this.bookings.filter(b => 
      b.status === 'CONFIRMED' && this.isBookingCompleted(b.journeyDate)
    ).length;
  }

  // Cancellation methods
  askCancelConfirmation(pnr: string): void {
    this.confirmingPnr = pnr;
    this.errorFlagFromCancelBooking = false;
    this.errorMessage = '';
  }

  closeCancelConfirm(): void {
    this.confirmingPnr = null;
  }

  confirmCancellation(pnr: string): void {
    this.cancellingPnr = pnr;
    this.errorFlagFromCancelBooking = false;
    
    this.bookingService.cancelBooking(pnr).subscribe({
      next: (response) => {
        console.log('Booking cancelled:', response);
        
        // Update booking status in the list
        const booking = this.bookings.find(b => b.pnr === pnr);
        if (booking) {
          booking.status = 'CANCELLED';
        }
        
        // Reapply filter after status change
        this.applyFilter();
        
        // Reset state
        this.confirmingPnr = null;
        this.cancellingPnr = null;
      },
      error: (err) => {
        console.error('Cancel failed:', err);
        this.errorMessage = err.error?.message || err.error?.error || 'Cancellation failed';
        this.errorFlagFromCancelBooking = true;
        this.confirmingPnr = null;
        this.cancellingPnr = null;
      }
    });
  }

  clearCancelError(): void {
    this.errorFlagFromCancelBooking = false;
    this.errorMessage = '';
  }
}
