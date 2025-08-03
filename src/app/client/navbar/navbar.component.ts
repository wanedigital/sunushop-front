import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/authservice.service';
import { PanierService } from '../../services/panier.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [RouterModule, CommonModule]

})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  currentUser: AuthResponse['user'] | null = null;
  nombreItemsPanier = 0;
  isMenuOpen = false;
  
  constructor(
    private authService: AuthService,
    private panierService: PanierService,
    private router: Router
  ) {}

  ngOnInit(): void {
      //this.authService.initializeUserFromStorage(); // ← ajoute cette ligne !
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    this.panierService.panier$.subscribe(panier => {
      this.nombreItemsPanier = this.panierService.getNombreItems();
    });
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    console.log('🔌 Déconnexion lancée');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToPanier(): void {
    this.router.navigate(['/client/panier']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
