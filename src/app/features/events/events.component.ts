import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Event, EventCategory } from '../models/event.model';
import { EventsService } from './events.service';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../../shared/toast/toast.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  apiUrl = environment.apiUrl;
  evenements: Event[] = [];
  evenementsAffiches: Event[] = [];
  categories: EventCategory[] = [];
  categorieChoisie: string = 'tous';
  recherche: string = '';

  //  Admin
  isAdmin = false;
  suppressionEnCours: string | null = null;

  constructor(
    private eventsService: EventsService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur connecté est admin
    this.isAdmin = this.authService.estAdmin();
    this.chargerLesEvenements();
  }

  chargerLesEvenements(): void {
    this.eventsService.chargerLesEvenements().subscribe({
      next: (data) => {
        this.evenements = data.map(event => ({
          ...event,
          image: event.image ? `${this.apiUrl}${event.image}` : undefined,
          eventDateTime: new Date(event.eventDateTime)
        }));

        const uniqueCategoriesMap = new Map();
        this.evenements.forEach(event => {
          if (event.category?._id) {
            uniqueCategoriesMap.set(event.category._id, event.category);
          }
        });
        this.categories = Array.from(uniqueCategoriesMap.values());
        this.categorieChoisie = 'tous';
        this.evenementsAffiches = [...this.evenements];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      }
    });
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
    this.evenementsAffiches = this.evenements.filter(event => {
      const catVal: any = event?.category ?? null;
      let eventCatIdentifier: string | null = null;

      if (typeof catVal === 'string') {
        eventCatIdentifier = catVal;
      } else if (typeof catVal === 'object' && catVal !== null) {
        eventCatIdentifier = catVal._id ?? null;
      }

      const matchCat =
        this.categorieChoisie === 'tous' ||
        eventCatIdentifier === this.categorieChoisie;

      const term = this.recherche.toLowerCase().trim();
      const matchRecherche =
        !term ||
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.shop?.name?.toLowerCase().includes(term);

      return matchCat && matchRecherche;
    });
  }

  toutReinitialiser(): void {
    this.recherche = '';
    this.categorieChoisie = 'tous';
    this.evenementsAffiches = [...this.evenements];
  }

  compterParCategorie(categoryId: string): number {
    return this.evenements.filter(e => (e.category as any)?._id === categoryId).length;
  }

  formaterDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  formaterHeure(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  getJour(date: Date): number {
    return new Date(date).getDate();
  }

  getMoisAbbr(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
  }

  //  Actions admin

  modifierEvenement(id: string, domEvent: MouseEvent): void {
    domEvent.stopPropagation(); // empêche la navigation vers le détail de l'événement
    this.router.navigate(['/evenements', id, 'modifier']);
  }

  supprimerEvenement(id: string, domEvent: MouseEvent): void {
    domEvent.stopPropagation();
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    this.suppressionEnCours = id;
    this.eventsService.supprimerEvenement(id).subscribe({
      next: () => {
        this.toastService.succes('Événement supprimé avec succès.');
        this.suppressionEnCours = null;
        this.eventsService.viderCache();
        this.chargerLesEvenements();
      },
      error: (err) => {
        this.toastService.erreur(err.error?.message || 'Erreur lors de la suppression.');
        this.suppressionEnCours = null;
      }
    });
  }
}
