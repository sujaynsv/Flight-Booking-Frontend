import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { SearchComponent } from './components/flights/search.component'; 
import { AuthGuard } from './guards/auth.guard';
import { BookingComponent } from './components/booking/booking.component';
import { TicketsComponent } from './components/tickets/tickets.component';
export const routes: Routes = [
  { 
    path: 'login', 
    component: AuthComponent 
  },
  { 
    path: 'search', 
    component: SearchComponent,  
    canActivate: [AuthGuard]
  },
  { 
    path: '', 
    redirectTo: '/search', 
    pathMatch: 'full' 
  },
  // { 
  //   path: '**', 
  //   redirectTo: '/search' 
  // }

  {
    path: 'booking/:flightId',
    component: BookingComponent, canActivate: [AuthGuard]
  },
  {
    path:'tickets',
    component: TicketsComponent, canActivate: [AuthGuard]
  }
];
