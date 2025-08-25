import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

export interface Produit {
  selected: boolean;
  id?: string;
  libelle: string;
  prix: number;
  quantite: number;
  image?: string;
  categorie_id: number;
  description: string;
  disponible: boolean;
}
export interface Categorie {
  id: number;
  libelle: string;
}

interface ApiResponse {
  data: Produit[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  apiUrl: string = "http://localhost:8000/api";

  constructor(private http: HttpClient) {}

  // 🔹 Récupérer token et construire les headers
private getAuthHeaders(): HttpHeaders {
  // Utilisez la même clé que dans AuthService
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  
  if (!token) {
    console.error('❌ Aucun token trouvé');
    return new HttpHeaders();
  }

  return new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  });
}




  // CRUD Produits

  getProduitsVendeur(): Observable<any> {
  const headers = this.getAuthHeaders();
  
  return this.http.get(`${this.apiUrl}/vendeur/produits`, { headers }).pipe(
    catchError(error => {
      
      if (error.status === 401) {
        //this.authService.logout();
        
      }
      return throwError(error);
    })
  );
}

  addProduit(data: FormData): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/produits`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  updateProduit(id: string, produit: FormData): Observable<Produit> {
    return this.http.post<Produit>(
      `${this.apiUrl}/produits/${id}?_method=PUT`,
      produit,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteProduit(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/produits/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  deleteProduitById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/produits/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getProduitById(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/produits/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/produits`, {
      headers: this.getAuthHeaders()
    });
  }

  getProduits(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/produits`, {
      headers: this.getAuthHeaders()
    });
  }
 

  // Boutiques
  createBoutique(boutiqueData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/boutiques`, boutiqueData, {
      headers: this.getAuthHeaders()
    });
  }

  getBoutiques() {
    return this.http.get<any>(`${this.apiUrl}/allboutiques`)
  }  
  deleteBoutique(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/boutiques/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Catégories
  createCategories(categorieData: any) {
    return this.http.post(`${this.apiUrl}/categories`, categorieData, {
      headers: this.getAuthHeaders()
    });
  }

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/categories`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('📂 Données catégories:', data))
    );
  }
}
