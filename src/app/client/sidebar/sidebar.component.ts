import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PanierService } from '../../services/panier.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [RouterModule, CommonModule]
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();
  
  nombreItemsPanier = 0;

  menuItems = [
    { path: '/client/boutiques', icon: '🏪', label: 'Boutiques' },
    { path: '/client/panier', icon: '🛒', label: 'Mon Panier', badge: true },
    { path: '/client/commandes', icon: '📦', label: 'Mes Commandes' },
    { path: '/client/historique', icon: '📜', label: 'Historique' },
    { path: '/client/profil', icon: '👤', label: 'Mon Profil' },
    { path: '/client/commande/confirmation', icon: '📦', label: 'Commandes invités' },
    { path: '/client/commande/recherche', icon: '📜', label: 'Recherche commandes invités' },

  ];

  constructor(
    private router: Router,
    private panierService: PanierService
  ) {}

  ngOnInit(): void {
    this.panierService.panier$.subscribe(panier => {
      this.nombreItemsPanier = this.panierService.getNombreItems();
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeSidebar.emit();
  }

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }
}
