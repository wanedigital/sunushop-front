import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Boutique, Produit, ProduitService } from '../../../services/produit.service';
import { PanierService } from '../../../services/panier.service';
import { CommonModule } from '@angular/common';

function mapStatus(status: string): 'ouvret' | 'fermer' {
  return status === 'ouvret' ? 'ouvret' : 'fermer';
}

@Component({
  selector: 'app-boutique-produits',
  templateUrl: './boutique-produits.component.html',
  styleUrls: ['./boutique-produits.component.css'],
  imports : [CommonModule]
})
export class BoutiqueProduitsComponent implements OnInit {
  boutique: Boutique | null = null;
  produits: Produit[] = [];
  boutiqueId: string = '';
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService,
    public panierService: PanierService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.boutiqueId = params['id'];
      if (this.boutiqueId) {
        // Charger boutique et produits en une seule requête
        this.loadBoutiqueAndProduits();
      }
    });
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/boutique-placeholder.png';
  }

  handleProduitImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/product-placeholder.jpg';
  }

  // Nouvelle méthode qui charge boutique et produits ensemble
  loadBoutiqueAndProduits(): void {
    this.loading = true;
    this.produitService.getBoutiqueWithProduits(this.boutiqueId).subscribe({
      next: (response) => {
        // Créer un objet boutique à partir du nom récupéré
        this.boutique = {
          id: this.boutiqueId,
          nom: response.boutique,
          adresse: response.boutique,
          logo: response.boutique_image || '/assets/images/boutique-placeholder.jpg'  ,       
          numeroCommercial: response.boutique ?? null,
          status: mapStatus(response.boutique),
          id_user: response.boutique,
          created_at: response.boutique,
          updated_at: response.boutique
        };
        this.produits = response.produits;
        
        // IMPORTANT: Définir la boutique courante dans le service panier
        this.panierService.setBoutiqueCourante(this.boutiqueId, response.boutique);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
      }
    });
  }

  // Méthodes devenues obsolètes - on peut les supprimer
  /*
  loadBoutiqueData(): void {
    this.produitService.getBoutiqueById(this.boutiqueId).subscribe({
      next: (boutique) => {
        this.boutique = boutique;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la boutique:', error);
        this.error = 'Erreur lors du chargement de la boutique';
      }
    });
  }

  loadProduits(): void {
    this.loading = true;
    
    // Option 1: Utiliser la méthode qui récupère juste les produits
    this.produitService.getProduitsByBoutique(this.boutiqueId).subscribe({
      next: (produits) => {
        this.produits = produits;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.error = 'Erreur lors du chargement des produits';
        this.loading = false;
      }
    });

    // Option 2: Alternative - Utiliser la méthode qui récupère boutique + produits
    /*
    this.produitService.getBoutiqueWithProduits(this.boutiqueId).subscribe({
      next: (response) => {
        this.produits = response.produits;
        // Vous pouvez aussi utiliser response.boutique si nécessaire
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.error = 'Erreur lors du chargement des produits';
        this.loading = false;
      }
    });
    */
  //}*/

  ajouterAuPanier(produit: Produit): void {
    // Vérifier la disponibilité avant d'ajouter
    if (!produit.disponible || produit.quantite === 0) {
      alert('Ce produit n\'est pas disponible');
      return;
    }

    this.panierService.ajouterAuPanier(produit, 1);
    // Optionnel: afficher une notification de succès
    alert(`${produit.libelle} ajouté au panier !`);
  }

  goToPanier(): void {
    this.router.navigate(['/client/panier']);
  }

  retourBoutiques(): void {
    // À adapter selon où vous voulez rediriger
    // Option 1: Si vous avez une page de liste des boutiques
    this.router.navigate(['/client/boutiques']);
    
    // Option 2: Si vous n'avez pas de page boutiques, rediriger vers l'accueil
    // this.router.navigate(['/client']);
    
    // Option 3: Utiliser le history back
    // window.history.back();
  }

  // Méthode utilitaire pour vérifier si un produit est en stock
  isProductAvailable(produit: Produit): boolean {
    return produit.disponible && produit.quantite > 0;
  }

  // Méthode pour obtenir le texte du stock
  getStockText(produit: Produit): string {
    if (!produit.disponible) return 'Indisponible';
    if (produit.quantite === 0) return 'Rupture';
    if (produit.quantite < 10) return `Stock limité (${produit.quantite})`;
    return 'En stock';
  }

  // Méthode pour obtenir la classe CSS du badge de stock
  getStockBadgeClass(produit: Produit): string {
    if (!produit.disponible || produit.quantite === 0) return 'out-of-stock';
    if (produit.quantite < 10) return 'low-stock';
    return 'in-stock';
  }
}