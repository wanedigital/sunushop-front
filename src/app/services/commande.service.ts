import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { PanierItem } from './panier.service';
import { AuthService } from './authservice.service';
import { ServiceService } from './service.service';

export interface Paiement {
  id: number;
  montantTotal: number;
  status: 'en attente' | 'reussi' | 'echoue';
  date: string;
  type_paiement_id?: number;
}

export interface Commande {
  id: number;
  numeroCommande: string;
  date: string;
  etat: 'en attente' | 'annuler' | 'valider' | 'en cours' | 'terminer';
  total: number;
  adresse: string;
  telephone: string;
  email?: string;
  notes?: string;
  nomComplet: string;
  items: {
    produit: any;
    quantite: number;
    prixUnitaire: number;
  }[];
  paiement?: Paiement; // Modifié pour être optionnel au cas où
}

export interface CommandeRequest {
  items: {
    produitId: string;
    quantite: number;
  }[];
  adresseLivraison: string;
  telephone: string;
  notes?: string;
  // Pour les clients non connectés
  nom?: string;
  prenom?: string;
  email?: string;
}

export interface CommandeInviteRequest {
  numeroCommande: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = 'http://localhost:8000/api'; // URL Laravel

  constructor(private http: HttpClient,
    private authService: AuthService


  ) { }
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

  // Créer une commande (connecté ou non connecté)
  creerCommande(commandeData: CommandeRequest): Observable<ApiResponse<Commande>> {
    const headers = this.authService.getHeaders();
    return this.http.post<ApiResponse<Commande>>(
      `${this.apiUrl}/commandes`,
      commandeData,
      { headers }
    );
  }

  // Obtenir les commandes de l'utilisateur connecté
  /*getCommandes(): Observable<ApiResponse<Commande[]>> {
    return this.http.get<ApiResponse<Commande[]>>(`${this.apiUrl}/commandes`);
  }*/

  getCommandes(): Observable<Commande[]> {
    const headers = this.authService.getHeaders();

    return this.http.get<ApiResponse<Commande[]>>(
      `${this.apiUrl}/commandes`,
      { headers }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Erreur lors de la récupération des commandes');
        }
      })
    );
  }


  // Obtenir une commande par ID
  getCommandeById(id: number): Observable<ApiResponse<Commande>> {
    return this.http.get<ApiResponse<Commande>>(`${this.apiUrl}/commandes/${id}`);
  }

  // Rechercher une commande d'invité
  getCommandeInvite(request: CommandeInviteRequest): Observable<ApiResponse<Commande>> {
    return this.http.post<ApiResponse<Commande>>(`${this.apiUrl}/commandes/invite/recherche`, request);
  }

  // Annuler une commande
  annulerCommande(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/commandes/${id}/annuler`, {});
  }

  // Méthodes utilitaires
  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en attente': 'En attente',
      'annuler': 'Annulée',
      'valider': 'Validée',
      'en cours': 'En cours',
      'terminer': 'Terminée'
    };
    return labels[statut] || statut;
  }

  getStatutColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'en attente': '#ffc107',
      'annuler': '#dc3545',
      'valider': '#28a745',
      'en cours': '#007bff',
      'terminer': '#6c757d'
    };
    return colors[statut] || '#6c757d';
  }

  peutEtreAnnulee(statut: string): boolean {
    return ['en attente', 'valider'].includes(statut);
  }

  getPaiementStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'en attente': 'Paiement en attente',
      'reussi': 'Paiement réussi',
      'echoue': 'Paiement échoué',
    };
    return labels[status] || status;
  }

  getPaiementStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'en attente': '#ffc107', // Jaune
      'reussi': '#28a745',     // Vert
      'echoue': '#dc3545',      // Rouge
    };
    return colors[status] || '#6c757d';
  }

  // recuperation de commande pour le vendeur

  getCommandesByBoutique(boutiqueId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/boutique/${boutiqueId}/commandes`, { headers }).pipe(
      catchError(error => {
        if (error.status === 401) {
          //this.authService.logout();

        }
        return throwError(error);
      })
    );
  }
  // modification de statut de commande pour le vendeur

  updateStatut(commandeId: number, newStatut: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(
      `${this.apiUrl}/commandes/${commandeId}/statut`,
      { etat: newStatut },
      { headers }
    ).pipe(
      catchError(error => {
        if (error.status === 401) {
          this.authService.logout();
        }
        return throwError(error);
      })
    );
  }

  updatePaiementStatus(commandeId: number, newStatus: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(
      `${this.apiUrl}/commandes/${commandeId}/paiement/statut`,
      { status: newStatus }, // Le backend attend 'status'
      { headers }
    ).pipe(
      catchError(error => {
        if (error.status === 401) {
          this.authService.logout();
        }
        return throwError(error);
      })
    );
  }
}