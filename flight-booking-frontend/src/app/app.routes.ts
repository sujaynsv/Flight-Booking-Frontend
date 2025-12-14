import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { SearchComponent } from './components/flights/search.component';  //  Changed from FlightSearchComponent
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    component: AuthComponent 
  },
  { 
    path: 'search', 
    component: SearchComponent,  //  Changed from FlightSearchComponent
    canActivate: [AuthGuard]
  },
  { 
    path: '', 
    redirectTo: '/search', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/search' 
  }
];
