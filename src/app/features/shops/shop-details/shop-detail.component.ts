import { Shop } from './../../models/shop.model';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🆕 ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ShopService } from '../shop.service';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../../environments/environment.development';
import { ShopDetailsService, Product, ProductCategory } from './shop-details.service';

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './shop-detail.component.html',
  styleUrls: ['./shop-detail.component.css']
})
export class ShopDetailComponent implements OnInit {

  shop: Shop | null = null;
  isLoading = true;
  notFound = false;
  products: Product[] = [];

  // 🆕 deux URLs séparées : une pour l'API, une pour les fichiers statiques
  apiUrl    = environment.apiUrl;                          // http://localhost:3000/api
  storageUrl = environment.apiUrl.replace('/api', '');     // http://localhost:3000

  // État du modal
  showModal = false;
  isEditMode = false;
  isSaving = false;
  editingProductId: string | null = null;
  categories: ProductCategory[] = [];
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  productForm = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shopService: ShopService,
    public authService: AuthService,
    private shopDetailsService: ShopDetailsService,
    private cdr: ChangeDetectorRef // 🆕
  ) {}

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
          // 🆕 utiliser storageUrl pour les images
          logo:       data.logo       ? this.storageUrl + data.logo       : undefined,
          coverPhoto: data.coverPhoto ? this.storageUrl + data.coverPhoto : undefined
        };
        this.isLoading = false;
        this.chargerProduits(shopId);
        this.cdr.detectChanges(); // 🆕
      },
      error: () => {
        this.notFound = true;
        this.isLoading = false;
      }
    });

    this.shopDetailsService.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: () => {}
    });
  }

  chargerProduits(shopId: string): void {
    this.shopDetailsService.getProductsByShop(shopId).subscribe({
      next: (prods) => {
        // 🆕 utiliser storageUrl pour les images produits
        this.products = prods.map(p => ({
          ...p,
          image: p.image ? this.storageUrl + p.image : 'assets/placeholder.png'
        }));
        this.cdr.detectChanges(); // 🆕 force l'affichage immédiat
      },
      error: () => { this.products = []; }
    });
  }

  // ===== MODAL =====

  ouvrirModalAjout(): void {
    this.isEditMode = false;
    this.editingProductId = null;
    this.productForm = { name: '', description: '', price: 0, stock: 0, category: '' };
    this.imagePreview = null;
    this.selectedFile = null;
    this.showModal = true;
    this.cdr.detectChanges(); // 🆕
  }

  ouvrirModalEdition(p: Product): void {
    this.isEditMode = true;
    this.editingProductId = p._id;
    this.productForm = {
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      category: ''
    };
    this.imagePreview = p.image || null;
    this.selectedFile = null;
    this.showModal = true;
    this.cdr.detectChanges(); // 🆕
  }

  fermerModal(): void {
    this.showModal = false;
    this.cdr.detectChanges(); // 🆕
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges(); // 🆕
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
              // 🆕 storageUrl pour l'image retournée
              image: updated.image ? this.storageUrl + updated.image : 'assets/placeholder.png'
            };
            this.products = [...this.products]; // 🆕 force la détection sur le tableau
          }
          this.isSaving   = false;
          this.showModal  = false;
          this.cdr.detectChanges(); // 🆕
        },
        error: () => { this.isSaving = false; alert('Erreur lors de la modification.'); }
      });

    } else {

      fd.append('shop', this.shop!._id);
      this.shopDetailsService.addProduct(fd).subscribe({
        next: (created) => {
          this.products = [
            ...this.products,
            {
              ...created,
              // 🆕 storageUrl pour l'image retournée
              image: created.image ? this.storageUrl + created.image : 'assets/placeholder.png'
            }
          ]; // 🆕 nouveau tableau = détection garantie
          this.isSaving  = false;
          this.showModal = false;
          this.cdr.detectChanges(); // 🆕
        },
        error: () => { this.isSaving = false; alert("Erreur lors de l'ajout."); }
      });
    }
  }

  supprimerProduit(productId: string, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm('Supprimer ce produit ?')) return;
    this.shopDetailsService.deleteProduct(productId).subscribe({
      next: () => {
        this.products = this.products.filter(p => p._id !== productId);
        this.cdr.detectChanges(); // 🆕
      },
      error: () => alert('Erreur lors de la suppression.')
    });
  }

  // ===== BOUTIQUE =====

  supprimerBoutique(): void {
    if (!this.shop?._id) return;
    if (!confirm(`Supprimer la boutique "${this.shop.name}" ? Cette action est irréversible.`)) return;
    this.shopService.supprimerBoutique(this.shop._id).subscribe({
      next: () => { alert('Boutique supprimée avec succès.'); this.router.navigate(['/boutiques']); },
      error: () => alert('Erreur lors de la suppression.')
    });
  }

  avoirIconeCategorie(icon: string): string { return icon || '🏪'; }
  getTelLink(): string { return this.shop?.phoneNumber ? `tel:${this.shop.phoneNumber}` : '#'; }
}
