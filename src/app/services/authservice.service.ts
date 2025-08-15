import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

export interface User {
  email: string;
  password: string;
  adresse?: string;
  prenom?: string;
  nom?: string;
  telephone?: string;
}

export interface AuthResponse {
  token: string;
  user: {
  [x: string]: any;
  id: String;
  email: String;
  password: String;
  adresse: String;
  prenom:String;
  nom:String;
  telephone:String;
  status:String;
  profil_id:String;
  email_verified_at:String;
  };
}

export interface ProfilUpdateRequest {
  nom: string;
  prenom: string;
  adresse: string;
  telephone?: string;
  email: string;
}

export interface PasswordChangeRequest {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost:8000/api";
  public currentUser = new BehaviorSubject<any>(null);

  
isVendeur(): boolean {
  const user = this.getUserInfo();
  return user?.profil?.libelle === 'Vendeur'; 
}
  // ✅ Enregistrement
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      ...userData,
      role: "client"
    }).pipe(
      tap(response => this.storeAuthData(response, true)) // On suppose qu'on se souvient à l'inscription
    );
  }

  // ✅ Connexion
  login(credentials: User & { remember?: boolean }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {this.storeAuthData(response, credentials.remember ?? false);
           console.log('Réponse login:', response);
           const token = (response.token as any).plainTextToken;
           localStorage.setItem('auth_token', token); 
                   // Stockez aussi le profil si nécessaire
          //localStorage.setItem('user_profile', response.user.profil.libelle);
           
          })
      );
  }

  // ✅ Stockage utilisateur
  private storeAuthData(response: AuthResponse, remember: boolean = false): void {
  const storage = remember ? localStorage : sessionStorage;

  const token = (response.token as any).plainTextToken ?? response.token;
  storage.setItem('auth_token', token);
  storage.setItem('auth_user', JSON.stringify(response.user));

  this.currentUser.next(response.user);
}


  // ✅ Récupérer le token
  getToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  // ✅ Récupérer l'utilisateur connecté (Observable)
  getCurrentUser(): Observable<any> {
    if (!this.currentUser.value) {
      const storedUser = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
      if (storedUser) {
        this.currentUser.next(JSON.parse(storedUser));
      }
    }
    return this.currentUser.asObservable();
  }

  // ✅ Récupérer directement les infos utilisateur
  getUserInfo(): any {
    return this.currentUser.value ?? JSON.parse(
      localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user') || 'null'
    );
  }

  // ✅ Initialiser à chaque chargement de l'app
  initializeUserFromStorage(): void {
    const token = this.getToken();
    const user = this.getUserInfo();

    if (token && user) {
      this.currentUser.next(user);
    }
  }

  

  // ✅ Déconnexion
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    this.currentUser.next(null);
  }

  // ✅ Statut de connexion
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ✅ Accès au nom, rôle...
  getName(): string {
    return this.getUserInfo()?.nom ?? 'Inconnu';
  }
  getUsername(): string {
    return this.getUserInfo()?.prenom ?? 'Inconnu';
  }
   getIdUser(): string {
    const user = this.getUserInfo();
    return user?.id || null;
  }

  

  getRole(): Observable<string> {
    const user = this.getUserInfo();
    return user?.profil?.libelle ?? null;
  }

  getHeaders(): HttpHeaders {
    const token = this.getToken();
     if (!token) {
    throw new Error('No token available');
  }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ✅ Méthodes de gestion de profil
  getProfil(): Observable<User> {
      const headers = this.getHeaders();

    return this.http.get<{ user: User }>(`${this.apiUrl}/user`, { headers })
      .pipe(
        map(response => response.user),
        tap(user => {
          this.currentUser.next(user);
          // Mise à jour du stockage
          const storage = localStorage.getItem('auth_user') ? localStorage : sessionStorage;
          storage.setItem('auth_user', JSON.stringify(user));
        })
      );
  }

  updateProfil(profilData: ProfilUpdateRequest): Observable<User> {
        const headers = this.getHeaders();

    return this.http.put<{ user: User }>(`${this.apiUrl}/user/update`, profilData, { headers })
      .pipe(
        map(response => response.user),
        tap(user => {
          this.currentUser.next(user);
          // Mise à jour du stockage
          const storage = localStorage.getItem('auth_user') ? localStorage : sessionStorage;
          storage.setItem('auth_user', JSON.stringify(user));
        })
      );
  }

  changerMotDePasse(passwordData: PasswordChangeRequest): Observable<User> {
    const headers = this.getHeaders();
    return this.http.patch<User>(
      `${this.apiUrl}/user/change-password`,
      passwordData,
      { headers }
    );
  }


}


