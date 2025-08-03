import { Component, OnInit, TrackByFunction } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { MenuItem } from '../../models/menu-item';
import { NgForOf, NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../services/authservice.service';
import {  Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [NgForOf, NgIf, NgClass,RouterModule],
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  isMobileView = false;
  sections: Array<'top' | 'bottom'> = ['top', 'bottom'];

  menuItems: Record<'top' | 'bottom', MenuItem[]> = {
    top: [
      { icon: 'bi-speedometer2', label: 'Statistique', route: '/vendeur/statistique', isActive: true },
      { icon: 'bi-bag-check', label: 'Ma Boutique', route: '/vendeur/produit' },
      { icon: 'bi-chat-dots', label: 'Commande', route: '/commandes' },
      { icon: 'bi-people', label: 'Clients', route: '/client' },
      { icon: 'bi-people', label: 'Categories', route: '/vendeur/categorie' }

    ],
    bottom: [
      { icon: 'bi-gear', label: 'Parametre', route: '/parametre' },
      { icon: 'bi-power', label: 'Logout', route: '/logout' }
    ]
  };

  trackByFn: TrackByFunction<MenuItem> = (index, item) => item.route;

  constructor(private layoutService: LayoutService, private auth:AuthService, private router:Router) {}

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
  logout() {
  this.auth.logout();
  alert("Vous avez été déconnecté.");
  this.router.navigate(['/accueil']);
}
}
