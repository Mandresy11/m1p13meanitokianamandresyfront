import { Shop } from './../../models/shop.model';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ShopService } from '../shop.service';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../../environments/environment.development';
import { ShopDetailsService, Product, ProductCategory, Review } from './shop-details.service';
import { ShopStatusBadgeComponent } from '../../../shared/shop-status-badge/shop-status-badge.component';

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ShopStatusBadgeComponent],
  templateUrl: './shop-detail.component.html',
  styleUrls: ['./shop-detail.component.css']
})
export class ShopDetailComponent implements OnInit {

  shop: Shop | null = null;
  isLoading = true;
  notFound = false;
  products: Product[] = [];

  apiUrl     = environment.apiUrl;
  storageUrl = environment.apiUrl.replace('/api', '');

  // Modal produit
  showModal         = false;
  isEditMode        = false;
  isSaving          = false;
  editingProductId: string | null = null;

  // Données
  reviews:    Review[]         = [];
  categories: ProductCategory[] = [];
  imagePreview: string | null  = null;
  selectedFile: File | null    = null;

  productForm = {
    name:        '',
    description: '',
    price:       0,
    stock:       0,
    category:    ''
  };

  // Modal avis
  showReviewModal = false;
  isSavingReview  = false;
  reviewErreur    = '';
  reviewForm      = { rating: 0, comment: '' };
  hoveredStar     = 0;

  constructor(
    private route:              ActivatedRoute,
    private router:             Router,
    private shopService:        ShopService,
    public  authService:        AuthService,
    private shopDetailsService: ShopDetailsService,
    private cdr:                ChangeDetectorRef
  ) {}

  // Getters

  get estAdmin(): boolean {
    return this.authService.estAdmin();
  }

  get estUser(): boolean {
    return this.authService.estConnecte() && !this.authService.estAdmin();
  }

  // Cycle de vie

  ngOnInit(): void {
    const shopId = this.route.snapshot.paramMap.get('id');
    if (!shopId) {
      this.notFound = true;
      this.isLoading = false;
      return;
    }

    // Charger la boutique
    this.shopService.obtenirBoutiqueParId(shopId).subscribe({
      next: (data) => {
        this.shop = {
          ...data,
          logo:       data.logo       ? this.storageUrl + data.logo       : undefined,
          coverPhoto: data.coverPhoto ? this.storageUrl + data.coverPhoto : undefined
        };
        this.isLoading = false;
        this.chargerProduits(shopId);
        this.cdr.detectChanges();
      },
      error: () => {
        this.notFound  = true;
        this.isLoading = false;
      }
    });

    // Charger les avis
    this.shopDetailsService.getReviewByShop(shopId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Reviews error:', err);
        this.reviews = [];
      }
    });

    // Charger les catégories produit
    this.shopDetailsService.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: ()    => {}
    });
  }

  // Produits

  chargerProduits(shopId: string): void {
    this.shopDetailsService.getProductsByShop(shopId).subscribe({
      next: (prods) => {
        this.products = prods.map(p => ({
          ...p,
          image: p.image ? this.storageUrl + p.image : 'assets/placeholder.png'
        }));
        this.cdr.detectChanges();
      },
      error: () => { this.products = []; }
    });
  }

  ouvrirModalAjout(): void {
    this.isEditMode      = false;
    this.editingProductId = null;
    this.productForm     = { name: '', description: '', price: 0, stock: 0, category: '' };
    this.imagePreview    = null;
    this.selectedFile    = null;
    this.showModal       = true;
    this.cdr.detectChanges();
  }

  ouvrirModalEdition(p: Product): void {
    this.isEditMode      = true;
    this.editingProductId = p._id;
    this.productForm     = {
      name:        p.name,
      description: p.description || '',
      price:       p.price,
      stock:       p.stock,
      category:    ''
    };
    this.imagePreview = p.image || null;
    this.selectedFile = null;
    this.showModal    = true;
    this.cdr.detectChanges();
  }

  fermerModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader      = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  soumettreFormulaire(): void {
    if (!this.productForm.name || !this.productForm.price || !this.productForm.category) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.isSaving = true;
    const fd = new FormData();
    fd.append('name',        this.productForm.name);
    fd.append('description', this.productForm.description);
    fd.append('price',       this.productForm.price.toString());
    fd.append('stock',       this.productForm.stock.toString());
    fd.append('category',    this.productForm.category);
    if (this.selectedFile) fd.append('image', this.selectedFile);

    if (this.isEditMode && this.editingProductId) {

      this.shopDetailsService.updateProduct(this.editingProductId, fd).subscribe({
        next: (updated) => {
          const idx = this.products.findIndex(p => p._id === this.editingProductId);
          if (idx !== -1) {
            this.products[idx] = {
              ...updated,
              image: updated.image ? this.storageUrl + updated.image : 'assets/placeholder.png'
            };
            this.products = [...this.products];
          }
          this.isSaving  = false;
          this.showModal = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isSaving = false;
          alert('Erreur lors de la modification.');
        }
      });

    } else {

      fd.append('shop', this.shop!._id);
      this.shopDetailsService.addProduct(fd).subscribe({
        next: (created) => {
          this.products = [
            ...this.products,
            {
              ...created,
              image: created.image ? this.storageUrl + created.image : 'assets/placeholder.png'
            }
          ];
          this.isSaving  = false;
          this.showModal = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isSaving = false;
          alert("Erreur lors de l'ajout.");
        }
      });
    }
  }

  supprimerProduit(productId: string, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm('Supprimer ce produit ?')) return;

    this.shopDetailsService.deleteProduct(productId).subscribe({
      next: () => {
        this.products = this.products.filter(p => p._id !== productId);
        this.cdr.detectChanges();
      },
      error: () => alert('Erreur lors de la suppression.')
    });
  }

  // Avis

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  ouvrirModalAvis(): void {
    this.reviewForm      = { rating: 0, comment: '' };
    this.reviewErreur    = '';
    this.hoveredStar     = 0;
    this.showReviewModal = true;
    this.cdr.detectChanges();
  }

  fermerModalAvis(): void {
    this.showReviewModal = false;
    this.cdr.detectChanges();
  }

  setRating(star: number): void {
    this.reviewForm.rating = star;
  }

  soumettreAvis(): void {
    if (!this.reviewForm.rating) {
      this.reviewErreur = 'Veuillez choisir une note.';
      return;
    }
    if (!this.reviewForm.comment.trim()) {
      this.reviewErreur = 'Veuillez écrire un commentaire.';
      return;
    }

    this.isSavingReview = true;
    this.reviewErreur   = '';

    this.shopDetailsService.addReview(this.shop!._id, this.reviewForm).subscribe({
      next: (review) => {
        const user    = this.authService.obtenirUtilisateur();
        this.reviews  = [
          {
            ...review,
            user: { _id: user?._id || '', username: user?.username || 'Vous' }
          },
          ...this.reviews
        ];
        this.isSavingReview  = false;
        this.showReviewModal = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.reviewErreur   = err.error?.message || "Erreur lors de l'envoi.";
        this.isSavingReview = false;
      }
    });
  }

  // Boutique

  supprimerBoutique(): void {
    if (!this.shop?._id) return;
    if (!confirm(`Supprimer la boutique "${this.shop.name}" ? Cette action est irréversible.`)) return;

    this.shopService.supprimerBoutique(this.shop._id).subscribe({
      next: () => {
        alert('Boutique supprimée avec succès.');
        this.router.navigate(['/boutiques']);
      },
      error: () => alert('Erreur lors de la suppression.')
    });
  }

  // Helpers

  avoirIconeCategorie(icon: string): string {
    return icon || '🏪';
  }

  getTelLink(): string {
    return this.shop?.phoneNumber ? `tel:${this.shop.phoneNumber}` : '#';
  }
}
