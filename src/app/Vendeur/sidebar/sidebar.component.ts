import { Component, OnInit, OnDestroy, TrackByFunction, HostListener } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { MenuItem } from '../../models/menu-item';
import { NgForOf, NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../services/authservice.service';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface User {
  nom: string;
  prenom: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [NgForOf, NgIf, NgClass, RouterModule],
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isMobileView = false;
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  menuItems: Record<'top' | 'bottom', MenuItem[]> = {
    top: [
       { 
        icon: 'bi bi-house', 
        label: 'Accueil', 
        route: '/accueil', 
        isActive: false 
      },
      { 
        icon: 'bi bi-speedometer2', 
        label: 'Statistiques', 
        route: '/vendeur/statistiques', 
        isActive: false 
      },
      
      { 
        icon: 'bi bi-shop', 
        label: 'Ma Boutique', 
        route: '/vendeur/produit', 
        isActive: false 
      },
      { 
        icon: 'bi bi-cart-check', 
        label: 'Commandes', 
        route: '/vendeur/mes-commandes', 
        isActive: false 
      },
      { 
        icon: 'bi bi-tags', 
        label: 'Catégories', 
        route: '/vendeur/categorie', 
        isActive: false 
      }
    ],
    bottom: [
      { 
        icon: 'bi bi-gear', 
        label: 'Paramètres', 
        route: '/vendeur/parametre', 
        isActive: false 
      },
      { 
        icon: 'bi bi-box-arrow-right', 
        label: 'Logout', 
        route: '/logout', 
        isActive: false 
      }
    ]
  };

  trackByFn: TrackByFunction<MenuItem> = (index, item) => item.label || index;

  constructor(
    private layoutService: LayoutService, 
    private auth: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeSubscriptions();
    this.initializeCurrentRoute();
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    // Gérer le redimensionnement de la fenêtre
    const isMobile = window.innerWidth <= 768;
    if (isMobile !== this.isMobileView) {
      this.isMobileView = isMobile;
    }
  }

  private initializeSubscriptions(): void {
    // Sidebar collapse state
    this.layoutService.isSidebarCollapsed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(collapsed => {
        this.isCollapsed = collapsed;
        this.updateBodyClass();
      });

    // Mobile view state
    this.layoutService.isMobileView$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isMobile => {
        this.isMobileView = isMobile;
      });

    // Router events pour mettre à jour l'item actif
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateActiveMenuItem(event.url);
      });
  }

  private initializeCurrentRoute(): void {
    const currentUrl = this.router.url;
    this.updateActiveMenuItem(currentUrl);
  }

  private loadCurrentUser(): void {
    // Simuler le chargement des données utilisateur
    // Remplacez par votre logique réelle
    this.currentUser = {
      nom: this.auth.getName(),
      prenom: this.auth.getUsername()
    };
  }

  private updateBodyClass(): void {
    const body = document.body;
    if (this.isCollapsed) {
      body.classList.add('sidebar-collapsed');
    } else {
      body.classList.remove('sidebar-collapsed');
    }
  }

  private updateActiveMenuItem(currentUrl: string): void {
    // Réinitialiser tous les items
    Object.keys(this.menuItems).forEach(section => {
      this.menuItems[section as keyof typeof this.menuItems].forEach(item => {
        item.isActive = false;
      });
    });

    // Trouver et activer l'item correspondant
    Object.keys(this.menuItems).forEach(section => {
      this.menuItems[section as keyof typeof this.menuItems].forEach(item => {
        if (item.route && currentUrl.startsWith(item.route) && item.route !== '/logout') {
          item.isActive = true;
        }
      });
    });
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  closeSidebar(): void {
    if (this.isMobileView) {
      this.isCollapsed = true;
      this.updateBodyClass();
    }
  }

  setActiveItem(item: MenuItem): void {
    if (item.label === 'Logout') {
      return; // Ne pas marquer logout comme actif
    }

    Object.keys(this.menuItems).forEach(section => {
      this.menuItems[section as keyof typeof this.menuItems].forEach(i => {
        i.isActive = false;
      });
    });
    
    item.isActive = true;

    // Fermer le sidebar sur mobile après sélection
    if (this.isMobileView) {
      this.closeSidebar();
    }
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
          this.auth.logout();
  
          // Redirection vers la page de login
          this.router.navigate(['/accueil']);

  
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
}