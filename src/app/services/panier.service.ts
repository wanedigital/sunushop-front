// ============= panier.service.ts =============
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Produit } from './produit.service';

export interface PanierItem {
  produit: Produit;
  quantite: number;
  boutiqueId: string; // Ajout du boutiqueId
}

export interface PanierData {
  items: PanierItem[];
  boutiqueId: string;
  boutiqueName: string;
}

@Injectable({
  providedIn: 'root'
})
export class PanierService {
  private panierSubject = new BehaviorSubject<PanierItem[]>([]);
  private currentBoutiqueId: string = '';
  private currentBoutiqueName: string = '';
  
  public panier$ = this.panierSubject.asObservable();

  constructor() {
    this.loadPanierFromStorage();
  }

  // ========== GESTION DE LA BOUTIQUE COURANTE ==========
  setBoutiqueCourante(boutiqueId: string, boutiqueName: string): void {
    if (this.currentBoutiqueId !== boutiqueId) {
      // Sauvegarder le panier actuel avant de changer
      this.savePanierToStorage();
      
      // Changer de boutique
      this.currentBoutiqueId = boutiqueId;
      this.currentBoutiqueName = boutiqueName;
      
      // Charger le panier de la nouvelle boutique
      this.loadPanierFromStorage();
    }
  }

  getCurrentBoutiqueId(): string {
    return this.currentBoutiqueId;
  }

  getCurrentBoutiqueName(): string {
    return this.currentBoutiqueName;
  }

  // ========== GESTION DES ARTICLES ==========
  ajouterAuPanier(produit: Produit, quantite: number): void {
    if (!this.currentBoutiqueId) {
      console.error('Aucune boutique sélectionnée');
      return;
    }

    const panier = this.panierSubject.value;
    const existingItem = panier.find(item => item.produit.id === produit.id);

    if (existingItem) {
      existingItem.quantite += quantite;
    } else {
      const newItem: PanierItem = {
        produit: produit,
        quantite: quantite,
        boutiqueId: this.currentBoutiqueId
      };
      panier.push(newItem);
    }

    this.panierSubject.next([...panier]);
    this.savePanierToStorage();
  }

  modifierQuantite(produitId: string, nouvelleQuantite: number): void {
    const panier = this.panierSubject.value;
    const item = panier.find(item => item.produit.id === produitId);

    if (item) {
      if (nouvelleQuantite <= 0) {
        this.retirerDuPanier(produitId);
      } else {
        item.quantite = nouvelleQuantite;
        this.panierSubject.next([...panier]);
        this.savePanierToStorage();
      }
    }
  }

  retirerDuPanier(produitId: string): void {
    const panier = this.panierSubject.value;
    const nouveauPanier = panier.filter(item => item.produit.id !== produitId);
    
    this.panierSubject.next(nouveauPanier);
    this.savePanierToStorage();
  }

  viderPanier(): void {
    this.panierSubject.next([]);
    this.savePanierToStorage();
  }

  // ========== CALCULS ==========
  getNombreItems(): number {
    return this.panierSubject.value.reduce((total, item) => total + item.quantite, 0);
  }

  getTotalPanier(): number {
    return this.panierSubject.value.reduce((total, item) => {
      return total + (item.produit.prix * item.quantite);
    }, 0);
  }

  isPanierVide(): boolean {
    return this.panierSubject.value.length === 0;
  }

  // ========== PERSISTANCE PAR BOUTIQUE ==========
  private getPanierStorageKey(): string {
    return `panier_boutique_${this.currentBoutiqueId}`;
  }

  private savePanierToStorage(): void {
    if (!this.currentBoutiqueId) return;

    const panierData: PanierData = {
      items: this.panierSubject.value,
      boutiqueId: this.currentBoutiqueId,
      boutiqueName: this.currentBoutiqueName
    };

    try {
      localStorage.setItem(this.getPanierStorageKey(), JSON.stringify(panierData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error);
    }
  }

  private loadPanierFromStorage(): void {
    if (!this.currentBoutiqueId) {
      this.panierSubject.next([]);
      return;
    }

    try {
      const savedData = localStorage.getItem(this.getPanierStorageKey());
      if (savedData) {
        const panierData: PanierData = JSON.parse(savedData);
        
        // Vérifier que les données correspondent à la boutique courante
        if (panierData.boutiqueId === this.currentBoutiqueId) {
          this.panierSubject.next(panierData.items || []);
        } else {
          this.panierSubject.next([]);
        }
      } else {
        this.panierSubject.next([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      this.panierSubject.next([]);
    }
  }

  // ========== MÉTHODES UTILITAIRES ==========
  // Récupérer tous les paniers (pour debug ou administration)
  getAllPaniers(): { [boutiqueId: string]: PanierData } {
    const allPaniers: { [boutiqueId: string]: PanierData } = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('panier_boutique_')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const panierData: PanierData = JSON.parse(data);
            allPaniers[panierData.boutiqueId] = panierData;
          }
        } catch (error) {
          console.error('Erreur lors de la lecture du panier:', key, error);
        }
      }
    }
    
    return allPaniers;
  }

  // Supprimer le panier d'une boutique spécifique
  supprimerPanierBoutique(boutiqueId: string): void {
    localStorage.removeItem(`panier_boutique_${boutiqueId}`);
    
    // Si c'est la boutique courante, vider aussi le panier en mémoire
    if (this.currentBoutiqueId === boutiqueId) {
      this.panierSubject.next([]);
    }
  }

  // Compter le nombre total d'articles dans tous les paniers
  getTotalItemsAllBoutiques(): number {
    const allPaniers = this.getAllPaniers();
    return Object.values(allPaniers).reduce((total, panier) => {
      return total + panier.items.reduce((subtotal, item) => subtotal + item.quantite, 0);
    }, 0);
  }
}