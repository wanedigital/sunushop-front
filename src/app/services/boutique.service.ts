// Exemple de correction pour le service BoutiqueService
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './authservice.service';

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Méthode pour récupérer le token
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  private getHeadersForFormData(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
      // Ne pas définir Content-Type pour FormData, le navigateur le fera automatiquement
    });
  }

  // CORRECTION: Utiliser la bonne route pour récupérer la boutique du vendeur connecté
    getMyBoutique(): Observable<any> {
      const headers = this.getHeaders();
      return this.http.get(`${this.apiUrl}/vendeur/produits`, { headers }).pipe(
        catchError(error => {
          if (error.status === 401) {
            this.authService.logout();
          }
          return throwError(error);
        })
      );
    }

  // Méthode pour récupérer toutes les boutiques (pour la vérification de doublons)
  getBoutiques(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/boutiques`, {
      headers: this.getHeaders()
    });
  }

  // Méthode pour créer une boutique
  createBoutique(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/boutique`, formData, {
      headers: this.getHeadersForFormData()
    });
  }

  // Méthode pour mettre à jour une boutique
updateBoutique(id: number, formData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/boutiques/${id}`, formData, {
    headers: {
      'Authorization': `Bearer ${this.authService.getToken()}`
    }
  });
}

  // Méthode alternative pour la mise à jour (PUT)
updateBoutiquePut(id: number, data: any): Observable<any> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${this.authService.getToken()}`,
    'Content-Type': 'application/json' // Force le type JSON
  });

  return this.http.put(`${this.apiUrl}/boutiques/${id}`, data, { headers });
}
}