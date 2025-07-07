import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface Produit {
  selected: boolean;
  id?: string;
  libelle: string;
  prix: number;
  quantite: number;
  image?: string;
  categorie_id:number;
  description: string;
  disponible: boolean;
}
export interface Categorie {
  id: number;
  libelle: string;
}
@Injectable({
  providedIn: 'root'
})
export class ServiceService {

   apiUrl: string = "http://localhost:8000/api";

  constructor(private http: HttpClient) {
  }
// CRUD Produits
// Ajout produit avec FormData
addProduit(produit: FormData): Observable<Produit> {
  return this.http.post<Produit>(`${this.apiUrl}/produits`, produit);
}

// Mise à jour produit avec FormData
updateProduit(id: string, produit: FormData): Observable<Produit> {
  return this.http.post<Produit>(`${this.apiUrl}/produits/${id}?_method=PUT`, produit);
}


  getProduitById(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/produits/${id}`);
  }

  getAllProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/produits`);
  }

  deleteProduitById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/produits/${id}`);
  }
  // boutiques 
  createBoutique(boutiqueData: any) {
    return this.http.post(`${this.apiUrl}/boutiques`, boutiqueData);
  }
  getBoutiques() {
    return this.http.get(`${this.apiUrl}/boutiques`);
  }
// Categories 
  createCategories(categorieData: any) {
    return this.http.post(`${this.apiUrl}/categories`, categorieData);
  }
getCategories(): Observable<Categorie[]> {
  return this.http.get<Categorie[]>(`${this.apiUrl}/categories`).pipe(
    tap(data => console.log('Données catégories:', data)) 
  );
}

    // Paginations 
getProduitsPagines(page: number, perPage: number): Observable<{data: Produit[], total: number}> {
  return this.http.get<{data: Produit[], total: number}>(`${this.apiUrl}/produits?page=${page}&perPage=${perPage}`);
}
}