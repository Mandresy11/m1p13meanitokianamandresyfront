import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse, UserResponse } from '../models/user.model';
import { environment } from '../../../environments/environment'; // ✅ import générique, pas .development

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // ✅ environment.apiUrl = 'http://localhost:3000' ou 'https://...onrender.com'
  // + '/api/auth' => 'http://localhost:3000/api/auth' ✅
  private apiUrl = environment.apiUrl + '/api/auth';

  private utilisateurConnecte = new BehaviorSubject<User | null>(
    this.recupererUtilisateurLocal()
  );

  utilisateur$ = this.utilisateurConnecte.asObservable();

  constructor(private http: HttpClient) {}

  //  CONNEXION EMAIL/MOT DE PASSE
  connecter(donnees: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, donnees).pipe(
      tap(reponse => {
        this.sauvegarderSession(
          reponse.userLogged.token,
          reponse.userLogged.user
        );
      })
    );
  }

  // INSCRIPTION
  inscrire(donnees: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/register`, donnees).pipe(
      tap(reponse => {
        this.sauvegarderSession(
          reponse.userCreated.token,
          reponse.userCreated.user
        );
      })
    );
  }

  // CONNEXION GOOGLE : redirige vers le backend
  connexionGoogle(): void {
    window.location.href = environment.apiUrl + '/api/auth/google';
  }

  // CALLBACK GOOGLE : sauvegarde le token reçu dans l'URL
  traiterCallbackGoogle(token: string, role: string, username: string, fullname: string, id: string): void {
    const user: User = {
      _id:      id,
      username: username,
      fullname: fullname,
      role:     role as 'client' | 'admin' | 'shop',
      gender:   'other',
      email:    ''
    };
    this.sauvegarderSession(token, user);
  }

  // MOT DE PASSE OUBLIÉ
  motDePasseOublie(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  // RÉINITIALISER MOT DE PASSE
  reinitialiserMotDePasse(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, { password });
  }

  // DÉCONNEXION
  deconnecter(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    localStorage.removeItem('shopId');
    this.utilisateurConnecte.next(null);
  }

  // UTILITAIRES
  estConnecte(): boolean {
    return !!localStorage.getItem('token');
  }

  obtenirToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenirRole(): string | null {
    const role = localStorage.getItem('role');
    return role ? JSON.parse(role) : null;
  }

  estAdmin(): boolean {
    return this.obtenirRole() === 'admin';
  }

  obtenirUtilisateur(): User | null {
    return this.utilisateurConnecte.getValue();
  }

  // PRIVÉ : sauvegarder la session
  private sauvegarderSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('utilisateur', JSON.stringify(user.username));
    localStorage.setItem('role', JSON.stringify(user.role));
    localStorage.setItem('id', JSON.stringify(user._id));
    if (user.role === 'shop' && user.shop) {
      localStorage.setItem('shopId', JSON.stringify(user.shop));
    }
    this.utilisateurConnecte.next(user);
  }

  private recupererUtilisateurLocal(): User | null {
    const data = localStorage.getItem('utilisateur');
    if (!data || data === 'undefined') return null;
    return data ? JSON.parse(data) : null;
  }
}
