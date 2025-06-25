import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

interface User {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
  id: String;
  email: String;
  password: String;
  adress: String;
  prenom:String;
  nom:String;
  telephone:String;
  status:String;
  profil_id:String;
  email_verified_at:String;
  };
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost:8000/api";
  private currentUser = new BehaviorSubject<any>(null);

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
        tap(response => this.storeAuthData(response, credentials.remember ?? false))
      );
  }

  // ✅ Stockage utilisateur
  private storeAuthData(response: AuthResponse, remember: boolean = false): void {
    const storage = remember ? localStorage : sessionStorage;

    storage.setItem('auth_token', response.token);
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

  getRole(): Observable<string> {
  return this.getCurrentUser().pipe(
    map(user => user?.profil ?? 'Aucun rôle')
  );
}

}


