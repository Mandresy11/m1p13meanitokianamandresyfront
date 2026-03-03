import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit {

  @Input() modeInitial: 'connexion' | 'inscription' = 'connexion';
  @Output() fermer   = new EventEmitter<void>();
  @Output() connecte = new EventEmitter<void>();

  mode: 'connexion' | 'inscription' | 'forgot' = 'connexion';

  loginData: LoginRequest = { email: '', password: '' };

  registerData: RegisterRequest = {
    username: '', fullname: '', gender: 'male', email: '', password: ''
  };

  confirmPassword     = '';
  chargement          = false;
  erreur              = '';
  succes              = '';
  motDePasseVisible   = false;
  confirmVisible      = false;

  emailOublie           = '';
  forgotChargement      = false;
  forgotErreur          = '';
  forgotSucces          = '';
  forgotEstCompteGoogle = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef  // ← ajout
  ) {}

  ngOnInit(): void {
    this.mode = this.modeInitial;
  }

  basculerMode(mode: 'connexion' | 'inscription' | 'forgot'): void {
    this.mode = mode;
    this.erreur                = '';
    this.succes                = '';
    this.forgotErreur          = '';
    this.forgotSucces          = '';
    this.forgotEstCompteGoogle = false;
    this.reinitialiserFormulaires();
  }

  onConnexion(): void {
    this.erreur = '';
    if (!this.loginData.email || !this.loginData.password) {
      this.erreur = 'Veuillez remplir tous les champs.';
      return;
    }
    this.chargement = true;
    this.authService.connecter(this.loginData).subscribe({
      next: () => {
        this.chargement = false;
        this.succes = 'Connexion réussie ! Bienvenue ';
        this.cdr.detectChanges(); // ← ajout
        setTimeout(() => {
          this.connecte.emit();
          this.fermer.emit();
          if (this.authService.estAdmin()) {
            this.router.navigate(['/dashboard']);
          } else if (this.authService.obtenirRole() === 'shop') {
            this.router.navigate(['/shop-dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        }, 1000);
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.message || 'Email ou mot de passe incorrect.';
        this.cdr.detectChanges(); // ← ajout
      }
    });
  }

  connexionGoogle(): void {
    this.authService.connexionGoogle();
  }

  onInscription(): void {
    this.erreur = '';
    if (!this.registerData.username || !this.registerData.fullname ||
        !this.registerData.email    || !this.registerData.password  ||
        !this.confirmPassword) {
      this.erreur = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.registerData.password !== this.confirmPassword) {
      this.erreur = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (this.registerData.password.length < 6) {
      this.erreur = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }
    this.chargement = true;
    this.authService.inscrire(this.registerData).subscribe({
      next: () => {
        this.chargement = false;
        this.succes = 'Compte créé avec succès ! Bienvenue ';
        this.cdr.detectChanges(); // ← ajout
        setTimeout(() => {
          this.connecte.emit();
          this.fermer.emit();
        }, 1000);
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.message || 'Erreur lors de la création du compte.';
        this.cdr.detectChanges(); // ← ajout
      }
    });
  }

  onForgotPassword(): void {
    this.forgotErreur          = '';
    this.forgotEstCompteGoogle = false;

    if (!this.emailOublie) {
      this.forgotErreur = 'Veuillez entrer votre adresse email.';
      return;
    }

    this.forgotChargement = true;
    this.authService.motDePasseOublie(this.emailOublie).subscribe({
      next: () => {
        this.forgotChargement = false;
        this.forgotSucces = '📧 Email envoyé ! Vérifiez votre boîte mail (et vos spams).';
        this.cdr.detectChanges(); // ← ajout
      },
      error: (err) => {
        this.forgotChargement = false;
        const message: string = err.error?.message || '';

        if (message.toLowerCase().includes('google')) {
          this.forgotEstCompteGoogle = true;
          this.forgotErreur = '🔗 Ce compte utilise Google. Connectez-vous avec le bouton ci-dessous.';
        } else {
          this.forgotErreur = message || 'Erreur lors de l\'envoi de l\'email.';
        }
        this.cdr.detectChanges(); // ← ajout
      }
    });
  }

  onFermer(event?: Event): void {
    if (!event || event.target === event.currentTarget) {
      this.fermer.emit();
    }
  }

  get passwordsCorrespondent(): boolean {
    return this.registerData.password === this.confirmPassword && this.confirmPassword.length > 0;
  }

  get passwordAssezLong(): boolean {
    return this.registerData.password.length >= 6;
  }

  private reinitialiserFormulaires(): void {
    this.loginData         = { email: '', password: '' };
    this.registerData      = { username: '', fullname: '', gender: 'male', email: '', password: '' };
    this.confirmPassword   = '';
    this.emailOublie       = '';
    this.motDePasseVisible = false;
    this.confirmVisible    = false;
  }
}
