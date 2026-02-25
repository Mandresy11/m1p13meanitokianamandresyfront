import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse, UserResponse } from '../models/user.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl + '/api/auth';

  private utilisateurConnecte = new BehaviorSubject<User | null>(
    this.recupererUtilisateurLocal()
  );

  utilisateur$ = this.utilisateurConnecte.asObservable();

  constructor(private http: HttpClient) {}

  // connexion
  connecter(donnees: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, donnees).pipe(
      tap(reponse => {
        localStorage.setItem('token', reponse.userLogged.token);
        localStorage.setItem('utilisateur', JSON.stringify(reponse.userLogged.user.username));
        localStorage.setItem('role', JSON.stringify(reponse.userLogged.user.role));
        this.utilisateurConnecte.next(reponse.userLogged.user);
      })
    );
    }

  // inscription
  inscrire(donnees: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/register`, donnees).pipe(
      tap(reponse => {
        console.log('Réponse de connexion:', reponse);
        localStorage.setItem('token', reponse.userCreated.token);
        localStorage.setItem('utilisateur', JSON.stringify(reponse.userCreated.user.username));
        alert(`Bienvenue ${reponse.userCreated.user.username}!`);
        this.utilisateurConnecte.next(reponse.userCreated.user);
      })
    );
  }

  // déconnexion
  deconnecter(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('role');
    this.utilisateurConnecte.next(null);
  }

  // utilitaires
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

  private recupererUtilisateurLocal(): User | null {
    const data = localStorage.getItem('utilisateur');
    if (!data || data === 'undefined') {
      return null;
    }
    return data ? JSON.parse(data) : null;
  }
}
