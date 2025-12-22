import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent {
  private router = inject(Router);

  goToAirlines(): void {
    this.router.navigate(['/airlines']);
  }

  goToInventory(): void {
    this.router.navigate(['/inventory']);
  }
}
