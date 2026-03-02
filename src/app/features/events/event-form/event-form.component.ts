import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EventsService } from '../events.service';
import { ShopService } from '../../shops/shop.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  eventId: string | null = null;
  isLoading = false;
  isSaving = false;
  apiUrl = environment.apiUrl;

  imagePreview: string | null = null;
  imageFile: File | null = null;

  // Listes pour les selects
  shops: any[] = [];
  categories: any[] = [];

  constructor(
    private fb: FormBuilder,
    private eventsService: EventsService,
    private shopService: ShopService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire
    this.form = this.fb.group({
      title:         ['', [Validators.required, Validators.minLength(3)]],
      description:   ['', [Validators.required, Validators.minLength(10)]],
      eventDateTime: ['', Validators.required],
      location:      ['', Validators.required],
      shop:          ['', Validators.required],
      category:      ['', Validators.required],
      price:         [{ value: 0, disabled: true }, [Validators.min(0)]],
      isFree:        [true]
    });

    // Activer/désactiver prix selon isFree — sans changer la valeur
    this.form.get('isFree')!.valueChanges.subscribe((free: boolean) => {
      const priceCtrl = this.form.get('price')!;
      if (free) {
        priceCtrl.disable({ emitEvent: false });
      } else {
        priceCtrl.enable({ emitEvent: false });
      }
    });

    // Charger les boutiques et catégories
    this.chargerDonnees();

    // Mode édition si id dans l'URL
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.isEditMode = true;
      this.chargerEvenement(this.eventId);
    }
  }

  get f() { return this.form.controls; }

  // Charger boutiques + catégories

  chargerDonnees(): void {
    // Charger les boutiques
    this.shopService.chargerLesBoutiques().subscribe({
      next: (shops) => this.shops = shops,
      error: (err) => console.error('Erreur chargement boutiques:', err)
    });

    // Charger les catégories d'événements
    this.eventsService.chargerLesCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: (err) => console.error('Erreur chargement catégories:', err)
    });
  }

  // Charger l'événement en mode édition

  chargerEvenement(id: string): void {
    this.isLoading = true;
    this.eventsService.obtenirEvenementParId(id).subscribe({
      next: (event) => {
        const dt = new Date(event.eventDateTime);
        const formatted = dt.toISOString().slice(0, 16);

        this.form.patchValue({
          title:         event.title,
          description:   event.description,
          eventDateTime: formatted,
          location:      event.location || '',
          shop:          (event.shop as any)?.name || '',
          category:      (event.category as any)?.name || '',
          price:         event.price || 0,
          isFree:        event.isFree ?? true
        });

        if (event.image) {
          this.imagePreview = this.apiUrl + event.image;
        }

        this.isLoading = false;
      },
      error: () => {
        this.toastService.erreur('Impossible de charger l\'événement.');
        this.isLoading = false;
        this.router.navigate(['/evenements']);
      }
    });
  }

  // Sélection image

  onImageChange(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => this.imagePreview = e.target.result;
    reader.readAsDataURL(file);
  }

  // Soumission

  soumettre(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const vals = this.form.getRawValue();

    const formData = new FormData();
    formData.append('title',         vals.title);
    formData.append('description',   vals.description);
    formData.append('eventDateTime', new Date(vals.eventDateTime).toISOString());
    formData.append('location',      vals.location);
    formData.append('shop',          vals.shop);        // nom de la boutique
    formData.append('category',      vals.category);    // nom de la catégorie
    formData.append('price',         vals.isFree ? '0' : (vals.price?.toString() || '0'));
    formData.append('isFree',        vals.isFree ? 'true' : 'false');

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    if (this.isEditMode && this.eventId) {
      this.eventsService.modifierEvenement(this.eventId, formData).subscribe({
        next: () => {
          this.eventsService.viderCache();
          this.toastService.succes('Événement modifié avec succès !');
          this.isSaving = false;
          this.router.navigate(['/evenements']);
        },
        error: (err) => {
          this.toastService.erreur(err.error?.message || 'Erreur lors de la modification.');
          this.isSaving = false;
        }
      });
    } else {
      this.eventsService.creerEvenement(formData).subscribe({
        next: () => {
          this.eventsService.viderCache();
          this.toastService.succes('Événement créé avec succès !');
          this.isSaving = false;
          this.router.navigate(['/evenements']);
        },
        error: (err) => {
          this.toastService.erreur(err.error?.message || 'Erreur lors de la création.');
          this.isSaving = false;
        }
      });
    }
  }
}
