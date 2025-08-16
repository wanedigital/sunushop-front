import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './authservice.service';

// interfaces/statistique.interface.ts
export interface SummaryData {
  total_orders: number;
  pending_orders: number;
  commandes_visiteurs: number;
  active_shops: number;
  total_clients_enregistres: number;
  total_vendors: number;
}

export interface UserGrowthData {
  date: string;
  nouveaux_clients: number;
  nouveaux_vendeurs: number;
}

export interface TopShop {
  boutique_id: number;
  nom_boutique: string;
  statut: string;
  nom_vendeur: string;
  nombre_commandes: number;
}

export interface TopProduct {
  produit_id: number;
  nom_produit: string;
  categorie: string;
  quantite_vendue: number;
}


@Injectable({
  providedIn: 'root'
})
export class StatistiqueService {
   private apiUrl = 'http://localhost:8000/api'; 
   constructor(private http: HttpClient, private authService: AuthService) { }


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

  getVentesParPeriode(type: 'mois' | 'annee' | 'semaine' | 'semestriel'): Observable<any> {
    return this.http.get(`${this.apiUrl}/ventes-vendeur/${type}`, {
      headers: this.getAuthHeaders()
    });
  }

  getMeilleursClients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/meilleurs-clients-vendeur`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Récupérer le nombre de nouvelles commandes (statut = 'en attente')
   */
  getNouvellesCommandes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/nouvelles-commandes-vendeur`, {
      headers: this.getAuthHeaders()
    });
  }

   /**
   * Récupérer ses clients
   */
    getClients(): Observable<any> {
     return this.http.get(`${this.apiUrl}/mes-clients`, {
      headers: this.getAuthHeaders()
    });
  }



  /**
   * Récupère le résumé des statistiques pour l'administrateur.
   */
  getSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/statistiques/summary`, { headers: this.getAuthHeaders() });
  }

  /**
   * Récupère les données sur la croissance des utilisateurs sur une période donnée.
   * @param periode - La période (ex: 'jour', 'semaine', 'mois', 'annee').
   */
  /*getUserGrowth(periode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/utilisateurs/croissance/${periode}`, { headers: this.getHeaders() });
  }*/
  getUserGrowth(periode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/statistiques/utilisateurs/croissance/${periode}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }
  
  private handleError(error: any): Observable<never> {
    console.error('Erreur API:', error);
    return throwError(() => new Error("Erreur lors de l'appel API"));
  }

  /**
   * Récupère le classement des meilleures boutiques.
   * @param limit - Le nombre de boutiques à retourner.
   */
  getTopShops(limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/statistiques/boutiques/classement/${limit}`, { headers: this.getAuthHeaders() });
  }

  /**
   * Récupère le classement des produits les plus vendus.
   * @param limit - Le nombre de produits à retourner.
   */
  getTopProducts(limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/statistiques/produits/classement/${limit}`, { headers: this.getAuthHeaders() });
  }
}

