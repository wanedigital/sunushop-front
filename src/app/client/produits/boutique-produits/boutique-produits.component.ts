import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Boutique, Categorie, Produit, ProduitService } from '../../../services/produit.service';
import { PanierService } from '../../../services/panier.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../../../services/layout.service';

function mapStatus(status: string): 'ouvret' | 'fermer' {
  return status === 'ouvret' ? 'ouvret' : 'fermer';
}

@Component({
  selector: 'app-boutique-produits',
  templateUrl: './boutique-produits.component.html',
  styleUrls: ['./boutique-produits.component.css'],
  imports : [CommonModule, FormsModule]
})
export class BoutiqueProduitsComponent implements OnInit, OnDestroy {
  boutique: Boutique | null = null;
  produits: Produit[] = [];
  boutiqueId: string = '';
  loading = true;
  error = '';
  categories: Categorie[] = [];
  searchTerm: string = '';
  selectedCategory: string | null = null;
  filteredProduits: Produit[] = [];
  showAllCategories = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService,
    public panierService: PanierService,
    private layoutService: LayoutService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.boutiqueId = params['id'];
      if (this.boutiqueId) {
        this.loadBoutiqueAndProduits();
        this.loadCategories();
      }
    });
  }

  ngOnDestroy(): void {
    this.layoutService.setCurrentBoutique(null);
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/boutique-placeholder.png';
  }

  handleProduitImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/product-placeholder.jpg';
  }

  loadBoutiqueAndProduits(): void {
    this.loading = true;
    this.produitService.getBoutiqueWithProduits(this.boutiqueId).subscribe({
      next: (response) => {
        console.log('BoutiqueProduitsComponent received response:', response);
        this.boutique = {
          id: this.boutiqueId,
          nom: response.boutique,
          adresse: response.boutique,
          logo: response.boutique_image,
          numeroCommercial: response.boutique ?? null,
          status: mapStatus(response.boutique),
          id_user: response.boutique,
          created_at: response.boutique,
          updated_at: response.boutique
        };
        this.produits = response.produits;

        this.layoutService.setCurrentBoutique(this.boutique);

        this.panierService.setBoutiqueCourante(this.boutiqueId, response.boutique);
        
        this.loading = false;
        this.filteredProduits = [...this.produits];

      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
        this.layoutService.setCurrentBoutique(null);
      }
    });
  }

  // Charger les catégories de la boutique
  loadCategories(): void {
    this.produitService.getCategoriesByBoutique(this.boutiqueId).subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erreur chargement catégories:', error);
      }
    });
  }

  // Filtrer les produits par catégorie
  filterByCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.showAllCategories = false;
    this.filteredProduits = this.produits.filter(p => p.categorie_id === categoryId);
  }

  // Afficher tous les produits
  showAllProducts(): void {
    this.selectedCategory = null;
    this.showAllCategories = true;
    this.filteredProduits = [...this.produits];
  }

  // Recherche de produits
  searchProducts(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredProduits = [...this.produits];
      return;
    }

    this.produitService.searchProduitsInBoutique(this.boutiqueId, this.searchTerm).subscribe({
      next: (results) => {
        this.filteredProduits = results;
      },
      error: (error) => {
        console.error('Erreur recherche:', error);
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