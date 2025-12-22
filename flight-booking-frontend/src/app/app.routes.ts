import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { SearchComponent } from './components/flights/search.component';
import { AuthGuard } from './guards/auth.guard';
import { BookingComponent } from './components/booking/booking.component';
import { TicketsComponent } from './components/tickets/tickets.component';
import { AddFlightComponent } from './components/flights/add-flight.component';
import { AirlineComponent } from './components/airline/airline.component';
import { RoleGuard } from './guards/role.guard';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [

  {
  path: 'profile',
  component: ProfileComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['ADMIN', 'USER'] }
},

  // Public auth route
  {
    path: 'login',
    component: AuthComponent
  },

  // Passenger-only routes
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['USER'] }
  },
  {
    path: 'booking/:flightId',
    component: BookingComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['USER'] }
  },
  {
    path: 'tickets',
    component: TicketsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['USER'] }
  },

  // Admin-only routes
  {
    path: 'airlines',
    component: AirlineComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'inventory',
    component: AddFlightComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },

  // Default route for unauthenticated users (will be overridden by guards for logged-in users)
  {
    path: '',
    redirectTo: '/search',
    pathMatch: 'full'
  },

  // Fallback
  {
    path: '**',
    redirectTo: '/search'
  }
];
