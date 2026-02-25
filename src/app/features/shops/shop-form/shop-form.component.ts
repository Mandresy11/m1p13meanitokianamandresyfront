import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ShopService } from '../shop.service';
import { environment } from '../../../../environments/environment.development';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-shop-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './shop-form.component.html',
  styleUrls: ['./shop-form.component.css']
})
export class ShopFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  shopId: string | null = null;
  isLoading = false;
  isSaving = false;
  apiUrl = environment.apiUrl;

  logoPreview: string | null = null;
  coverPreview: string | null = null;
  logoFile: File | null = null;
  coverFile: File | null = null;

  categories: any[] = [];

  constructor(
    private fb: FormBuilder,
    private shopService: ShopService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:        ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category:    ['', Validators.required],
      level:       ['', Validators.required],
      section:     ['', [Validators.required, Validators.maxLength(5)]],
      phoneNumber: ['']
    });

    this.shopService.chargerCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: (err) => console.error('Erreur chargement catégories:', err)
    });

    this.shopId = this.route.snapshot.paramMap.get('id');
    if (this.shopId) {
      this.isEditMode = true;
      this.chargerBoutique(this.shopId);
    }
  }

  chargerBoutique(id: string): void {
    this.isLoading = true;
    this.shopService.obtenirBoutiqueParId(id).subscribe({
      next: (shop) => {
        this.form.patchValue({
          name:        shop.name,
          description: shop.description,
          category:    shop.category?._id,
          level:       shop.location?.level,
          section:     shop.location?.section,
          phoneNumber: shop.phoneNumber || ''
        });

        if (shop.logo)       this.logoPreview  = this.apiUrl + shop.logo;
        if (shop.coverPhoto) this.coverPreview = this.apiUrl + shop.coverPhoto;

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.erreur('Impossible de charger la boutique.');
        this.router.navigate(['/boutiques']);
      }
    });
  }

  onLogoChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.logoFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => this.logoPreview = e.target.result;
    reader.readAsDataURL(file);
  }

  onCoverChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.coverFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => this.coverPreview = e.target.result;
    reader.readAsDataURL(file);
  }

  soumettre(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;

    const formData = new FormData();
    formData.append('name',        val.name);
    formData.append('description', val.description);
    formData.append('category',    val.category);
    formData.append('phoneNumber', val.phoneNumber || '');
    formData.append('location', JSON.stringify({
      level:   Number(val.level),
      section: val.section.toUpperCase()
    }));

    if (this.logoFile)  formData.append('logo',       this.logoFile);
    if (this.coverFile) formData.append('coverPhoto', this.coverFile);

    this.isSaving = true;

    const requete$ = this.isEditMode && this.shopId
      ? this.shopService.modifierBoutique(this.shopId, formData)
      : this.shopService.creerBoutique(formData);

    requete$.subscribe({
      next: () => {
        this.isSaving = false;
        this.toastService.succes(this.isEditMode ? '✏️ Boutique modifiée avec succès !' : '🏪 Boutique créée avec succès !');
        this.router.navigate(['/boutiques']);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Erreur:', err);
        this.toastService.erreur('Une erreur est survenue. Vérifiez les champs et réessayez.');
      }
    });
  }

  get f() { return this.form.controls; }
}
