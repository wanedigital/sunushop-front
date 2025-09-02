// ============= panier.component.ts =============
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PanierItem, PanierService } from '../../services/panier.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

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

    console.log("Infos :", !!this.currentBoutiqueId && !!this.currentBoutiqueName)
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
Swal.fire({
        title: 'Êtes-vous sûr de vouloir retirer ce produit du panier ?',
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
            this.panierService.retirerDuPanier(produitId);
            // Message de confirmation
            Swal.fire('Retiré', 'Vous avez retiré le produit avec succès.', 'success');
          } catch (err) {
            Swal.fire('Erreur', 'échoué.', 'error');
          }
        }
      }).catch((err) => {
            console.error('Erreur lors de l’affichage du dialogue :', err);
            Swal.fire('Erreur', 'Une erreur est survenue.', 'error');
          });
  }

  viderPanier(): void {
    Swal.fire({
        title: 'Êtes-vous sûr de vouloir vider votre panier ?',
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
                this.panierService.viderPanier();

            // Message de confirmation
            Swal.fire('Panier vidé', 'Votre panier a été vidé avec succès.', 'success');
          } catch (err) {
            Swal.fire('Erreur', 'L/operation a échoué.', 'error');
          }
        }
      }).catch((err) => {
            console.error('Erreur lors de l’affichage du dialogue :', err);
            Swal.fire('Erreur', 'Une erreur est survenue.', 'error');
          });
  }

  continuerAchats(): void {
    // Retourner à la boutique spécifique ou à la liste des boutiques
    if (this.currentBoutiqueId) {
      this.router.navigate(['/client/boutiques', this.currentBoutiqueId, 'produits']);
    } else {
      // Fallback si pas de boutique courante
      this.router.navigate(['/accueil']);
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