// ============= panier.component.ts =============
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PanierItem, PanierService } from '../../services/panier.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panier',
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.css'],
  imports : [CommonModule]
})
export class PanierComponent implements OnInit {
  panierItems: PanierItem[] = [];
  total = 0;
  currentBoutiqueId = '';
  currentBoutiqueName = '';

  constructor(
    private panierService: PanierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer les informations de la boutique courante
    this.currentBoutiqueId = this.panierService.getCurrentBoutiqueId();
    this.currentBoutiqueName = this.panierService.getCurrentBoutiqueName();

    // S'abonner aux changements du panier
    this.panierService.panier$.subscribe(panier => {
      this.panierItems = panier;
      this.total = this.panierService.getTotalPanier();
    });
  }

  modifierQuantiteDepuisEvent(idProduit: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const valeur = Number(input.value);
    this.modifierQuantite(idProduit, valeur);
  }

  modifierQuantite(produitId: string, quantite: number): void {
    if (quantite < 1) {
      this.retirerProduit(produitId);
    } else {
      this.panierService.modifierQuantite(produitId, quantite);
    }
  }

  retirerProduit(produitId: string): void {
    if (confirm('Êtes-vous sûr de vouloir retirer ce produit du panier ?')) {
      this.panierService.retirerDuPanier(produitId);
    }
  }

  viderPanier(): void {
    if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      this.panierService.viderPanier();
    }
  }

  continuerAchats(): void {
    // Retourner à la boutique spécifique ou à la liste des boutiques
    if (this.currentBoutiqueId) {
      this.router.navigate(['/client/boutiques', this.currentBoutiqueId, 'produits']);
    } else {
      // Fallback si pas de boutique courante
      this.router.navigate(['/client/boutiques']);
    }
  }

  passerCommande(): void {
    if (this.panierItems.length === 0) {
      alert('Votre panier est vide !');
      return;
    }
    
    // Passer les informations de la boutique à la commande
    this.router.navigate(['/client/commandes'], {
      queryParams: { 
        boutiqueId: this.currentBoutiqueId,
        boutique: this.currentBoutiqueName 
      }
    });
  }

  // Méthodes utilitaires pour le template
  getBoutiqueName(): string {
    return this.currentBoutiqueName || 'Boutique inconnue';
  }

  hasBoutiqueInfo(): boolean {
    return !!this.currentBoutiqueId && !!this.currentBoutiqueName;
  }

  // Méthode pour gérer les erreurs d'images
  onImageError(event: any): void {
    event.target.src = '/assets/images/product-placeholder.jpg';
  }
}