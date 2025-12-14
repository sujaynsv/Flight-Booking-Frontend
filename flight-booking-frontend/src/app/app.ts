import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * APP COMPONENT: Root component (outermost)
 * 
 * This is the first component that loads
 * RouterOutlet = "show the current route's component here"
 * 
 * Flow:
 * 1. App starts
 * 2. AppComponent loads
 * 3. RouterOutlet shows AuthComponent or FlightSearchComponent
 *    based on current URL
 */
@Component({
  selector: 'app-root',
  standalone: true,
  // Import RouterOutlet to enable routing in this component
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  title = 'Flight Booking Frontend';
}
