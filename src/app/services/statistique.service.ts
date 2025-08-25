import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './authservice.service';
import { environment } from '../../environments/environment';

// +++++++++++++++++ INTERFACES +++++++++++++++++

// Interface générique pour les réponses de l'API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

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
  private apiUrl = `${environment.apiUrl}/admin/statistiques`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * Récupère le résumé des statistiques pour l'administrateur.
   */
  getSummary(): Observable<ApiResponse<SummaryData>> {
    return this.http.get<ApiResponse<SummaryData>>(`${this.apiUrl}/summary`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère les données sur la croissance des utilisateurs sur une période donnée.
   * @param periode - La période (ex: 'jour', 'semaine', 'mois', 'annee').
   */
  getUserGrowth(periode: string): Observable<ApiResponse<UserGrowthData[]>> {
    return this.http.get<ApiResponse<UserGrowthData[]>>(`${this.apiUrl}/utilisateurs/croissance/${periode}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère le classement des meilleures boutiques.
   * @param limit - Le nombre de boutiques à retourner.
   */
  getTopShops(limit: number = 10): Observable<ApiResponse<TopShop[]>> {
    return this.http.get<ApiResponse<TopShop[]>>(`${this.apiUrl}/boutiques/classement/${limit}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère le classement des produits les plus vendus.
   * @param limit - Le nombre de produits à retourner.
   */
  getTopProducts(limit: number = 10): Observable<ApiResponse<TopProduct[]>> {
    return this.http.get<ApiResponse<TopProduct[]>>(`${this.apiUrl}/produits/classement/${limit}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
  
  /**
   * Gestionnaire d'erreurs centralisé pour les appels HTTP.
   */
  private handleError(error: any): Observable<never> {
    console.error('Une erreur API est survenue:', error);
    return throwError(() => new Error("Une erreur est survenue lors de la communication avec le serveur. Veuillez réessayer plus tard."));
  }
}
