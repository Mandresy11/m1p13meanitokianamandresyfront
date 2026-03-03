import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../features/auth/auth.service';
import { AuthModalComponent } from '../../features/auth/auth-modal/auth-modal.component';
import { CartService } from '../../features/cart/cart.service';
import { CartDrawerComponent } from '../../shared/cart-drawer/cart-drawer.component';
import { User } from '../../features/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    AuthModalComponent,
    CartDrawerComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit, OnDestroy {

  menuOuvert             = false;
  modalVisible           = false;
  modeModal: 'connexion' | 'inscription' = 'connexion';
  utilisateur: User | null = null;
  menuUtilisateurOuvert  = false;
  cartCount              = 0;
  drawerVisible          = false;

  // ✅ Pour éviter les memory leaks
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef  // ✅ FIX : injection du ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    // Écouter connexion/déconnexion
    this.authService.utilisateur$
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => {
        this.utilisateur = u;
        if (u) {
          this.cartService.chargerPanier().subscribe();
        } else {
          this.cartService.reinitialiser();
        }
        this.cdr.markForCheck(); // ✅ forcer la mise à jour
      });

    // ✅ FIX PRINCIPAL : forcer la détection après chaque update du compteur
    this.cartService.count$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.cartCount = count;
        this.cdr.markForCheck(); // ✅ Angular re-render immédiatement le badge
      });
  }

  // ✅ Nettoyage propre des subscriptions
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ouvrirConnexion(): void {
    this.modeModal    = 'connexion';
    this.modalVisible = true;
    this.menuOuvert   = false;
  }

  ouvrirInscription(): void {
    this.modeModal    = 'inscription';
    this.modalVisible = true;
    this.menuOuvert   = false;
  }

  fermerModal(): void {
    this.modalVisible = false;
  }

  getRole(): string | null {
  const role = localStorage.getItem('role');
  return role ? JSON.parse(role) : null;
}

  onConnecte(): void {
    this.cartService.chargerPanier().subscribe();
  }

  deconnecter(): void {
    this.authService.deconnecter();
    this.cartService.reinitialiser();
    this.menuUtilisateurOuvert = false;
    this.drawerVisible         = false;
    this.router.navigate(['/']);
  }

  toggleMenuUtilisateur(): void {
    this.menuUtilisateurOuvert = !this.menuUtilisateurOuvert;
  }

  getInitiales(): string {
    if (!this.utilisateur?.fullname) return '?';
    return this.utilisateur.fullname
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  ouvrirDrawer(): void {
    this.drawerVisible         = true;
    this.menuUtilisateurOuvert = false;
    this.menuOuvert            = false;
  }

  fermerDrawer(): void {
    this.drawerVisible = false;
  }
}
