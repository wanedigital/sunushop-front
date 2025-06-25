import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Plat {
  id?: string;
  nom: string;
  prix: number;
  quantite: number;
  imageUrl?: string;
  categorie_id:number;
  description: string;
  disponibilite: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

   apiUrl: string = "http://localhost:8000/api";

  constructor(private http: HttpClient) {
  }
    AddProduit(produit: any): Observable<any> {
    return this.http.post(this.apiUrl, produit);
  }

  getProduitById(id: string): Observable<any> {
    return this.http.get<Plat>(`${this.apiUrl}/${id}`);
  }
   getAlProduit(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
DeleteProduitById(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/produits/${id}`);
  }
  EditProduitById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/produits/${id}`);
  }
}
