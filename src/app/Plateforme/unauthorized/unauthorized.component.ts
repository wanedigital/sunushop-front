import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authservice.service';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent {
  
  constructor(private router: Router, private authService: AuthService) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToHome() {
    if (this.authService.isAuthenticated()) {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin/statistique']);
      } else if (this.authService.isVendeur()) {
        this.router.navigate(['/vendeur/statistique']);
      } else if (this.authService.isClient()) {
        this.router.navigate(['/client/boutiques']);
      } else {
        this.router.navigate(['/accueil']);
      }
    } else {
      this.router.navigate(['/accueil']);
    }
  }
}