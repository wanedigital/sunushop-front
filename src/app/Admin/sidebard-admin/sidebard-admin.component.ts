import { Component, TrackByFunction } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from '../../models/menu-item';
import { LayoutService } from '../../services/layout.service';
import { NgForOf, NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../services/authservice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebard-admin',
  imports: [NgForOf, NgIf, NgClass,RouterModule],
  templateUrl: './sidebard-admin.component.html',
  styleUrl: './sidebard-admin.component.css'
})
export class SidebardAdminComponent {
  
isSidebarExpanded = false;
  constructor(public router: Router, private auth:AuthService, private layoutService: LayoutService, ) {
  }

  isCollapsed = false;
  isMobileView = false;
  sections: Array<'top' | 'bottom'> = ['top', 'bottom'];

  menuItems: Record<'top' | 'bottom', MenuItem[]> = {
      top: [
       { icon: 'bi-house', label: 'Accueil', route: '/accueil'},
        { icon: 'bi-bag-check', label: 'Les Boutiques', route: 'boutiques', isActive: true  },
        { icon: 'bi-pie-chart', label: 'Statistiques', route: '/admin/statistique' },
        { icon: 'bi-bag', label: 'Produits', route: 'produit' },
        { icon: 'bi-person-badge', label: 'Utilisateurs', route: 'admin/vendeur' }
      ],
      bottom: [
        { icon: 'bi-power', label: 'Logout', route: '/logout', }
      ]
    };
  
    trackByFn: TrackByFunction<MenuItem> = (index, item) => item.route;
    
    ngOnInit(): void {
    this.layoutService.isSidebarCollapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
  
      const body = document.body;
      if (collapsed) {
        body.classList.add('sidebar-collapsed');
      } else {
        body.classList.remove('sidebar-collapsed');
      }
    });
  
    this.layoutService.isMobileView$.subscribe(isMobile => {
      this.isMobileView = isMobile;
    });
  }
  
  
  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  
    const isCollapsed = !this.isCollapsed;
    const body = document.body;
  
    if (isCollapsed) {
      body.classList.add('sidebar-collapsed');
    } else {
      body.classList.remove('sidebar-collapsed');
    }
  
    this.isCollapsed = isCollapsed;
  }
  
  
    setActiveItem(item: MenuItem): void {
      Object.keys(this.menuItems).forEach(section => {
        this.menuItems[section as 'top' | 'bottom'].forEach(i => i.isActive = false);
      });
      item.isActive = true;
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
