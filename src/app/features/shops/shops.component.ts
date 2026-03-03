import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Shop, Category } from '../models/shop.model';
import { ShopService } from './shop.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment.development';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmModalComponent } from '../../shared/confirm/confirm-modal.component';
import { ShopStatusBadgeComponent } from '../../shared/shop-status-badge/shop-status-badge.component';

@Component({
  selector: 'app-shops',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ConfirmModalComponent,
    ShopStatusBadgeComponent
  ],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopsComponent implements OnInit {

  constructor(
    private shopService: ShopService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  shops: Shop[] = [];
  apiUrl = environment.apiUrl;
  boutiquesAffichees: Shop[] = [];
  categories: Category[] = [];
  isLoading = false;

  modalVisible = false;
  shopIdASupprimer: string | null = null;

  categorieChoisie: string = 'tout';
  recherche: string = '';

  // 🎲 Restaurant aléatoire
  restaurantAleatoire: Shop | null = null;
  isSpinning = false;
  aucunRestaurant = false;

  get estAdmin(): boolean {
    return this.authService.estAdmin();
  }

  ngOnInit(): void {
    this.chargerLesBoutiques();
  }

  chargerLesBoutiques(): void {
    this.isLoading = true;
    this.shopService.chargerLesBoutiques().subscribe({
      next: (data) => {
        this.shops = data.map(shop => ({
          ...shop,
          logo: shop.logo ? this.apiUrl + shop.logo : undefined,
          coverPhoto: shop.coverPhoto ? this.apiUrl + shop.coverPhoto : undefined
        }));

        const uniqueCategoriesMap = new Map();
        this.shops.forEach(shop => {
          if (shop.category?._id) {
            uniqueCategoriesMap.set(shop.category._id, shop.category);
          }
        });
        this.categories = Array.from(uniqueCategoriesMap.values());
        this.categorieChoisie = 'tout';
        this.boutiquesAffichees = [...this.shops];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // Restaurant aléatoire
  choisirRestaurantAleatoire(): void {
    this.isSpinning = true;
    this.restaurantAleatoire = null;
    this.aucunRestaurant = false;

    setTimeout(() => {
      const resultat = this.shopService.selectionnerRestaurantAleatoire(this.shops);
      if (resultat) {
        this.restaurantAleatoire = resultat;
      } else {
        this.aucunRestaurant = true;
      }
      this.isSpinning = false;
      this.cdr.detectChanges();
    }, 900);
  }

  fermerResultat(): void {
    this.restaurantAleatoire = null;
    this.aucunRestaurant = false;
  }

  supprimerBoutique(shopId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.shopIdASupprimer = shopId;
    this.modalVisible = true;
  }

  confirmerSuppression(): void {
    if (!this.shopIdASupprimer) return;
    this.modalVisible = false;

    this.shopService.supprimerBoutique(this.shopIdASupprimer).subscribe({
      next: () => {
        this.shops = this.shops.filter(s => s._id !== this.shopIdASupprimer);
        this.boutiquesAffichees = this.boutiquesAffichees.filter(s => s._id !== this.shopIdASupprimer);
        this.shopIdASupprimer = null;
        this.cdr.detectChanges();
        this.toastService.succes('Boutique supprimée avec succès &#x2713;');
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.shopIdASupprimer = null;
        this.toastService.erreur('Erreur lors de la suppression.');
      }
    });
  }

  annulerSuppression(): void {
    this.modalVisible = false;
    this.shopIdASupprimer = null;
  }

  filtrerParCategorie(categorie: string): void {
    this.categorieChoisie = categorie;
    this.appliquerLesFiltres();
  }

  quandOnCherche(event: any): void {
    this.recherche = event.target.value;
    this.appliquerLesFiltres();
  }

  appliquerLesFiltres(): void {
    this.boutiquesAffichees = this.shops.filter(boutique => {
      const catVal: any = boutique?.category ?? null;
      let boutiqueCatIdentifier: string | null = null;

      if (typeof catVal === 'string') {
        boutiqueCatIdentifier = catVal;
      } else if (typeof catVal === 'object' && catVal !== null) {
        boutiqueCatIdentifier = catVal._id ?? catVal.name;
      }

      const bonneCategorie = this.categorieChoisie === 'tout' || boutiqueCatIdentifier === this.categorieChoisie;
      const correspondRecherche =
        this.recherche === '' ||
        boutique.name.toLowerCase().includes(this.recherche.toLowerCase()) ||
        boutique.description.toLowerCase().includes(this.recherche.toLowerCase());

      return bonneCategorie && correspondRecherche;
    });
  }

  toutReinitialiser(): void {
    this.categorieChoisie = 'tout';
    this.recherche = '';
    this.boutiquesAffichees = [...this.shops];
  }

  avoirIconeCategorie(categorie: string): string {
    const trouvé = this.categories.find(c => c._id === categorie || c.name === categorie);
    if (trouvé?.icon) return trouvé.icon;

    const icones: any = {
      'Mode & Vêtements': '&#x1F454;',
      'Électronique': '&#x1F4F1;',
      'Restauration': '&#x1F37D;&#xFE0F;',
      'Beauté & Cosmétiques': '&#x1F484;',
      'Sports & Loisirs': '&#x26BD;',
      'Autre': '&#x1F3EA;'
    };
    return icones[categorie] || '&#x1F3EA;';
  }

  combienDansCetteCategorie(categorie: string): number {
    return this.shops.filter(b =>
      (b.category as any)._id === categorie || b.category.name === categorie
    ).length;
  }
}
