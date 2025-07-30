import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Produit {
  id: string;
  libelle: string; // Changé de 'nom' à 'libelle' pour correspondre à Laravel
  description: string;
  prix: number;
  quantite: number; // Changé de 'stock' à 'quantite'
  image: string;
  disponible: boolean; // Ajouté pour correspondre à Laravel
  categorie_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Boutique {
  id: string;
  nom: string;
  adresse: string;
  logo: string;
  numeroCommercial?: string; // ⬅ nouveau champ nullable
  status: 'ouvret' | 'fermer'; // ⬅ enum synchronisé avec Laravel
  id_user: string;   
  created_at?: string;
  updated_at?: string;
}

export interface ProduitBoutique {
  id: string;
  id_produit: string;
  id_boutique: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private apiUrl = 'http://localhost:8000/api'; // Port Laravel par défaut

  constructor(private http: HttpClient) {}

  // ========== MÉTHODES BOUTIQUES ==========
  getBoutiques(): Observable<Boutique[]> {
    return this.http.get<Boutique[]>(`${this.apiUrl}/boutiques`);
  }

  getBoutiqueById(id: string): Observable<Boutique> {
    return this.http.get<Boutique>(`${this.apiUrl}/boutiques/${id}`);
  }

  // ========== MÉTHODES PRODUITS ==========
  getProduits(page: number = 1, perPage: number = 10, search?: string): Observable<PaginatedResponse<Produit>> {
    let params = `?page=${page}&perPage=${perPage}`;
    if (search) {
      params += `&search=${search}`;
    }
    return this.http.get<PaginatedResponse<Produit>>(`${this.apiUrl}/produits${params}`);
  }

  getProduitById(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/produits/${id}`);
  }

  createProduit(produitData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/produits`, produitData);
  }

  updateProduit(id: string, produitData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/produits/${id}`, produitData);
  }

  deleteProduit(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/produits/${id}`);
  }

  // ========== MÉTHODES PRODUIT-BOUTIQUES ==========
  getProduitsBoutiques(): Observable<ProduitBoutique[]> {
    return this.http.get<ProduitBoutique[]>(`${this.apiUrl}/produit-boutiques`);
  }

  addProduitToBoutique(idProduit: string, idBoutique: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/produit-boutiques`, {
      id_produit: idProduit,
      id_boutique: idBoutique
    });
  }

  removeProduitFromBoutique(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/produit-boutiques/${id}`);
  }

  // ========== MÉTHODE POUR RÉCUPÉRER LES PRODUITS D'UNE BOUTIQUE ==========
  // Correspond à votre endpoint existant dans BoutiqueController
  getProduitsByBoutique(boutiqueId: string): Observable<Produit[]> {
    return this.http.get<{boutique: string, produits: Produit[]}>(`${this.apiUrl}/boutiques/${boutiqueId}/produits`)
      .pipe(
        map(response => this.mapProduitsFromLaravel(response.produits))
      );
  }

  // Méthode alternative si vous voulez récupérer aussi le nom de la boutique
  // Méthode alternative si vous voulez récupérer aussi le nom de la boutique
  getBoutiqueWithProduits(boutiqueId: string): Observable<{boutique: string, boutique_image?: string, produits: Produit[]}> {
    console.log('🔍 Calling API:', `${this.apiUrl}/boutiques/${boutiqueId}/produits`);
    
    return this.http.get<{boutique: string, boutique_image?: string, produits: any[]}>(`${this.apiUrl}/boutiques/${boutiqueId}/produits`)
      .pipe(
        map(response => {
          console.log('📦 Raw API Response:', response);
          const mappedProduits = this.mapProduitsFromLaravel(response.produits);
          console.log('✅ Mapped Products:', mappedProduits);
          
          return {
            boutique: response.boutique,
            boutique_image: response.boutique_image,
            produits: mappedProduits
          };
        })
      );
  }roduits(boutiqueId: string): Observable<{boutique: string, produits: Produit[]}> {
    console.log('🔍 Calling API:', `${this.apiUrl}/boutiques/${boutiqueId}/produits`);
    
    return this.http.get<{boutique: string, produits: any[]}>(`${this.apiUrl}/boutiques/${boutiqueId}/produits`)
      .pipe(
        map(response => {
          console.log('📦 Raw API Response:', response);
          const mappedProduits = this.mapProduitsFromLaravel(response.produits);
          console.log('✅ Mapped Products:', mappedProduits);
          
          return {
            boutique: response.boutique,
            produits: mappedProduits
          };
        })
      );
  }

  // ========== MÉTHODES UTILITAIRES ==========
  // Convertir un Produit Laravel vers le format Angular (si nécessaire)
  mapProduitFromLaravel(produitLaravel: any): Produit {
    return {
      id: produitLaravel.id,
      libelle: produitLaravel.libelle,
      description: produitLaravel.description || '',
      prix: produitLaravel.prix,
      quantite: produitLaravel.quantite,
      image: this.getImageUrl(produitLaravel.image),
      disponible: produitLaravel.disponible,
      categorie_id: produitLaravel.categorie_id,
      created_at: produitLaravel.created_at,
      updated_at: produitLaravel.updated_at
    };
  }

  // Méthode pour construire l'URL complète de l'image
  private getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '/assets/images/product-placeholder.jpg'; // Image par défaut
    }
    
    // Si l'URL est déjà complète (commence par http)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Si c'est juste le nom du fichier ou chemin relatif
    if (imagePath.startsWith('produits/')) {
      return `http://localhost:8000/storage/${imagePath}`;
    }
    
    // Si c'est juste le nom du fichier
    return `http://localhost:8000/storage/produits/${imagePath}`;
  }

  // Méthode similaire pour les boutiques
  getBoutiqueImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '/assets/images/boutique-placeholder.jpg';
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('boutiques/')) {
      return `http://localhost:8000/storage/${imagePath}`;
    }
    
    return `http://localhost:8000/storage/boutiques/${imagePath}`;
  }

  // Convertir un array de produits
  mapProduitsFromLaravel(produitsLaravel: any[]): Produit[] {
    return produitsLaravel.map(produit => this.mapProduitFromLaravel(produit));
  }

  // Créer FormData pour l'envoi de fichiers
  createProduitFormData(produit: Partial<Produit>, imageFile?: File): FormData {
    const formData = new FormData();
    
    if (produit.libelle) formData.append('libelle', produit.libelle);
    if (produit.description) formData.append('description', produit.description);
    if (produit.prix !== undefined) formData.append('prix', produit.prix.toString());
    if (produit.quantite !== undefined) formData.append('quantite', produit.quantite.toString());
    if (produit.disponible !== undefined) formData.append('disponible', produit.disponible.toString());
    if (produit.categorie_id) formData.append('categorie_id', produit.categorie_id);
    if (imageFile) formData.append('image', imageFile);

    return formData;
  }
}