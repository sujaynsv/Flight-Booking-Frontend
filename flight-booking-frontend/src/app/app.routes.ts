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
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { HomeComponent } from './components/home/home.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';

export const routes: Routes = [

  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },


  {
    path: 'login',
    component: AuthComponent
  },


  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'USER'] }
  },


  {
    path: 'admin',
    component: AdminHomeComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },


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
  {
    path: 'change-password', component: ChangePasswordComponent

  },
  {
    path:'forgot-password',
    component: ForgotPasswordComponent
  },


  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
