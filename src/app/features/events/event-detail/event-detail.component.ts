import { Component, OnInit } from '@angular/core';
import { Event } from '../../models/event.model';
import { environment } from '../../../../environments/environment.development';
import { EventsService } from '../events.service';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

interface EventDetail {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  price?: number;
  isFree: boolean;
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {

  apiUrl = environment.apiUrl;
  isLoading = true;
  notFound = false;
  event: Event | null = null;
  evenementsSimilaires: Event[] = []; // 🆕

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventsService: EventsService,
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id') || '';
    if (!eventId) {
      this.notFound = true;
      this.isLoading = false;
      return;
    }

    this.eventsService.obtenirEvenementParId(eventId).subscribe({
      next: (data) => {
        this.event = {
          ...data,
          image: data.image ? `${this.apiUrl}${data.image}` : undefined,
          eventDateTime: new Date(data.eventDateTime)
        };
        // ✅ Charger les similaires ICI, après que this.event est assigné
        this.chargerEvenementsSimilaires(eventId);
        this.isLoading = false;
      },
      error: () => {
        this.notFound = true;
        this.isLoading = false;
      }
      })
    }

    chargerEvenementsSimilaires(currentId: string): void {
    this.eventsService.chargerLesEvenements().subscribe({
      next: (data) => {
        const currentCategoryId = (this.event!.category as any)?._id;

        // Même catégorie, sans l'événement actuel
        let similaires = data
          .filter(e => e._id !== currentId && (e.category as any)?._id === currentCategoryId)
          .slice(0, 3);

        // Compléter si moins de 3
        if (similaires.length < 3) {
          const autres = data
            .filter(e => e._id !== currentId && (e.category as any)?._id !== currentCategoryId)
            .slice(0, 3 - similaires.length);
          similaires = [...similaires, ...autres];
        }

        this.evenementsSimilaires = similaires.map(e => ({
          ...e,
          image: e.image ? `${this.apiUrl}${e.image}` : undefined,
          eventDateTime: new Date(e.eventDateTime)
        }));
      },
      error: (err) => console.error('Erreur événements similaires', err)
    });
  }

  formaterDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formaterHeure(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  getJour(date: Date): string {
    return new Date(date).getDate().toString().padStart(2, '0');
  }

  getMoisAbbr(date: Date): string {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return mois[new Date(date).getMonth()];
  }

  getCategorieIcone(categorie: string): string {
    const icones: any = {
      'Concert': '🎵', 'Exposition': '🎨', 'Défilé de mode': '👗',
      'Vente privée': '🛍️', 'Animation': '🎪', 'Spectacle': '🎭', 'Autre': '📅'
    };
    return icones[categorie] || '📅';
  }

  formaterPrix(prix: number): string {
    return prix.toLocaleString('fr-FR') + ' Ar';
  }
}
