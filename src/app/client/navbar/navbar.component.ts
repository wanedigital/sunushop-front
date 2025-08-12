import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/authservice.service';
import { PanierService } from '../../services/panier.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { Boutique } from '../../services/produit.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [RouterModule, CommonModule]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  currentUser: AuthResponse['user'] | null = null;
  nombreItemsPanier = 0;
  isMenuOpen = false;
  isGuestMenuOpen = false;
  
  menuItems: any[] = [];
  userMenuLabelsPreview: string[] = [];
  currentBoutique: Boutique | null = null;
  private layoutSubscription: Subscription | undefined;

  private guestMenuItems = [
    { action: () => this.navigateToBoutique(), icon: '🏪', label: 'Boutiques' },
    { path: '/client/panier', icon: '🛒', label: 'Panier', badge: true },
    { path: '/client/commandes', icon: '📦', label: 'Passer Commande' },
    { path: '/client/commande/recherche', icon: '📜', label: 'Suivre Commande' },
  ];

  private userMenuItems = [
    { action: () => this.navigateToBoutique(), icon: '🏪', label: 'Boutiques' },
    { path: '/client/panier', icon: '🛒', label: 'Mon Panier', badge: true },
    { path: '/client/commandes', icon: '📦', label: 'Mes Commandes' },
    { path: '/client/historique', icon: '📜', label: 'Historique' },
    { path: '/client/profil', icon: '👤', label: 'Mon Profil' },
  ];

  constructor(
    private authService: AuthService,
    private panierService: PanierService,
    private router: Router,
    private layoutService: LayoutService
  ) {
    this.userMenuLabelsPreview = this.userMenuItems
      .map(item => item.label)
      .filter(label => !['Boutiques', 'Mon Panier'].includes(label));
  }

  ngOnInit(): void {
    this.layoutSubscription = this.layoutService.currentBoutique$.subscribe(boutique => {
      console.log('Navbar received boutique logo URL:', boutique?.logo);
      this.currentBoutique = boutique;
    });

    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.menuItems = this.userMenuItems;
      } else {
        this.menuItems = this.guestMenuItems;
      }
    });

    this.panierService.panier$.subscribe(panier => {
      this.nombreItemsPanier = this.panierService.getNombreItems();
    });
  }

  ngOnDestroy(): void {
    if (this.layoutSubscription) {
      this.layoutSubscription.unsubscribe();
    }
  }

  navigateToBoutique(): void {
    const id = this.panierService.getCurrentBoutiqueId();
    if (id) {
      this.router.navigate(['/client/boutiques', id, 'produits']);
    } else {
      this.router.navigate(['/plateforme/accueil']);
    }
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToPanier(): void {
    this.router.navigate(['/client/panier']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleGuestMenu(): void {
    this.isGuestMenuOpen = !this.isGuestMenuOpen;
  }
}
