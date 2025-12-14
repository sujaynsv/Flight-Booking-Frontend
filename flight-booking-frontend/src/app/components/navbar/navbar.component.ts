// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';  //  Add this
// import { RouterModule } from '@angular/router';  //  Add this
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-navbar',
//   standalone: true,  //  Add this
//   imports: [CommonModule, RouterModule],  //  Add this
//   templateUrl: './navbar.component.html',
//   styleUrls: ['./navbar.component.css']
// })
// export class NavbarComponent implements OnInit {
//   isLoggedIn$ = this.authService.isLoggedIn$;
//   currentUser$ = this.authService.currentUser$;

//   constructor(
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//   }

//   logout(): void {
//     this.authService.logout().subscribe(
//       () => {
//         this.router.navigate(['/login']);
//       }
//     );
//   }
// }
