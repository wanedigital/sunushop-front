import { Component, EventEmitter, Output, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/authservice.service';
import { PanierService } from '../../services/panier.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { Boutique } from '../../services/produit.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

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
  
  // Nouvelle propriété pour le menu mobile
  isMobileMenuOpen = false;
 
  menuItems: any[] = [];
  userMenuLabelsPreview: string[] = [];
  currentBoutique: Boutique | null = null;
  private layoutSubscription: Subscription | undefined;

  private guestMenuItems = [
    { action: () => this.navigateToBoutique(), icon: '🏪', label: 'Boutiques' },
    { path: '/client/panier', icon: '🛒', label: 'Panier', badge: true },
    { path: '/client/commandes', icon: '📦', label: 'Passer Commande' },
    { path: '/client/commande/recherche', icon: '📜', label: 'Suivre Commande' },
    { path: '/client/profil', icon: '👤', label: 'Mon Profil' },

  ];

  private userMenuItems = [
    { action: () => this.navigateToBoutique(), icon: '🏪', label: 'Boutiques' },
    { path: '/client/panier', icon: '🛒', label: 'Mon Panier', badge: true },
    { path: '/client/commandes', icon: '📦', label: 'Mes Commandes' },
    { path: '/client/historique', icon: '📜', label: 'Historique' },
   // { path: '/client/profil', icon: '👤', label: 'Mon Profil' },
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
      console.log('Boutique infos:', this.currentBoutique);

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

  // Méthodes existantes
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
  Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: "Vous ne pourrez pas annuler cette action !",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, continuer',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      try {
        // Déconnexion de l'utilisateur
        this.authService.logout();

        // Redirection vers la page de login
        this.router.navigate(['/login']);

        // Message de confirmation
        Swal.fire('Déconnecté', 'Vous avez été déconnecté avec succès.', 'success');
      } catch (err) {
        console.error('Erreur lors de la déconnexion :', err);
        Swal.fire('Erreur', 'La déconnexion a échoué.', 'error');
      }
    }
  }).catch((err) => {
    console.error('Erreur lors de l’affichage du dialogue :', err);
    Swal.fire('Erreur', 'Une erreur est survenue.', 'error');
  });
}

  goToPanier(): void {
    this.router.navigate(['/client/panier']);
  }

    goToProfil(): void {
    this.router.navigate(['/client/profil']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    // Fermer les autres menus
    if (this.isMenuOpen) {
      this.isGuestMenuOpen = false;
    }
  }

  toggleGuestMenu(): void {
    this.isGuestMenuOpen = !this.isGuestMenuOpen;
    // Fermer les autres menus
    if (this.isGuestMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  // Nouvelles méthodes pour le menu mobile
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Fermer les autres menus desktop
    if (this.isMobileMenuOpen) {
      this.isMenuOpen = false;
      this.isGuestMenuOpen = false;
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // Fermer tous les menus
  closeAllMenus(): void {
    this.isMenuOpen = false;
    this.isGuestMenuOpen = false;
    this.isMobileMenuOpen = false;
  }

  // Écouter les clics en dehors pour fermer les menus
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Vérifier si le clic est en dehors des menus dropdown
    const isInsideDropdown = target.closest('.dropdown') || target.closest('.mobile-nav-menu');
    
    if (!isInsideDropdown) {
      this.isMenuOpen = false;
      this.isGuestMenuOpen = false;
    }
  }

  // Fermer le menu mobile lors du redimensionnement de l'écran
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth > 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  // Gérer l'échappement pour fermer les menus
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    this.closeAllMenus();
  }
}