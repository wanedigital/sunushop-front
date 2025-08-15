import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatistiqueService {
  private apiUrl = 'http://localhost:8000/api'; 

  constructor(private http: HttpClient) {}

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

}