import { Shop } from './../../models/shop.model';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ShopService } from '../shop.service';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../../environments/environment.development';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shop-detail.component.html',
  styleUrls: ['./shop-detail.component.css']
})
export class ShopDetailComponent implements OnInit {

  shop: Shop | null = null;
  isLoading = true;
  notFound = false;
  products: Product[] = [];
  apiUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shopService: ShopService,
    public authService: AuthService
  ) {}

  // 👇 Getter pour vérifier si l'utilisateur est admin
  get estAdmin(): boolean {
    return this.authService.estAdmin();
  }

  ngOnInit(): void {
    const shopId = this.route.snapshot.paramMap.get('id');
    if (!shopId) {
      this.notFound = true;
      this.isLoading = false;
      return;
    }

    this.shopService.obtenirBoutiqueParId(shopId).subscribe({
      next: (data) => {
        this.shop = {
          ...data,
          logo: data.logo ? this.apiUrl + data.logo : undefined,
          coverPhoto: data.coverPhoto ? this.apiUrl + data.coverPhoto : undefined
        };
        this.isLoading = false;
      },
      error: () => {
        this.notFound = true;
        this.isLoading = false;
      }
    });
  }

  // 👇 Supprimer la boutique (admin uniquement)
  supprimerBoutique(): void {
    if (!this.shop?._id) return;
    if (!confirm(`Supprimer la boutique "${this.shop.name}" ? Cette action est irréversible.`)) return;

    this.shopService.supprimerBoutique(this.shop._id).subscribe({
      next: () => {
        alert('Boutique supprimée avec succès.');
        this.router.navigate(['/boutiques']);
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        alert('Erreur lors de la suppression.');
      }
    });
  }

  avoirIconeCategorie(icon: string): string {
    return icon || '🏪';
  }

  getTelLink(): string {
    return this.shop?.phoneNumber ? `tel:${this.shop.phoneNumber}` : '#';
  }
}
