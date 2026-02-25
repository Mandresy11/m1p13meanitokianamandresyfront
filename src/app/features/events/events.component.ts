import { ShopService } from './../shops/shop.service';
import { ChangeDetectorRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Event, EventCategory } from '../models/event.model';
import { EventsService } from './events.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // RouterLink ajouté
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  constructor(
    private eventsService: EventsService,
    private cdr: ChangeDetectorRef,
  ) {}

  apiUrl = environment.apiUrl;
  evenements: Event[] = [];
  evenementsAffiches: Event[] = [];
  categories: EventCategory[] = [];
  categorieChoisie: string = 'tous';
  recherche: string = '';

  ngOnInit(): void {
    this.chargerLesEvenements();
  }

  chargerLesEvenements(): void {
    this.eventsService.chargerLesEvenements().subscribe({
      next: (data) => {
        console.log(data)
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
        })
        this.categories = Array.from(uniqueCategoriesMap.values());
        this.categorieChoisie = 'tous';
        this.evenementsAffiches = [...this.evenements];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      }
    })
    /*this.evenements = [
      {
        _id: '1',
        title: 'Soirée DJ - Summer Vibes',
        description: 'Soirée musicale avec les meilleurs DJs de la capitale',
        eventDateTime: new Date('2026-03-01T20:00:00'),
        location: 'Espace événementiel - Niveau 3',
        category: 'Concert',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        price: 15000,
        isFree: false
      },
      {
        _id: '2',
        title: 'Exposition Art Contemporain',
        description: 'Découvrez les œuvres d\'artistes locaux talentueux',
        eventDateTime: new Date('2026-03-01T10:00:00'),
        location: 'Galerie d\'art - Niveau 2',
        category: 'Exposition',
        image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800',
        isFree: true
      },
      {
        _id: '3',
        title: 'Défilé de Mode - Printemps 2026',
        description: 'Présentation des nouvelles collections printemps-été',
        eventDateTime: new Date('2026-03-05T18:00:00'),
        location: 'Scène centrale - Niveau 1',
        category: 'Défilé de mode',
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea1f5140?w=800',
        price: 25000,
        isFree: false
      },
      {
        _id: '4',
        title: 'Ventes Privées - Mode & Accessoires',
        description: 'Jusqu\'à -70% sur une sélection d\'articles',
        eventDateTime: new Date('2026-03-10T09:00:00'),
        location: 'Toutes les boutiques Mode',
        category: 'Vente privée',
        image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800',
        isFree: true
      },
      {
        _id: '5',
        title: 'Animation Enfants - Magie & Cirque',
        description: 'Spectacle de magie et numéros de cirque pour les enfants',
        eventDateTime: new Date('2026-03-15T14:00:00'),
        location: 'Espace enfants - Niveau 2',
        category: 'Animation',
        image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800',
        isFree: true
      },
      {
        _id: '6',
        title: 'Concert Acoustique - Jazz Night',
        description: 'Soirée jazz avec des musiciens internationaux',
        eventDateTime: new Date('2026-03-20T20:00:00'),
        location: 'Food Court - Niveau 3',
        category: 'Concert',
        image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
        price: 20000,
        isFree: false
      },
      {
        _id: '7',
        title: 'Spectacle de Danse - Urban Dance',
        description: 'Compétition de danse hip-hop et breakdance',
        eventDateTime: new Date('2026-03-25T19:00:00'),
        location: 'Scène centrale - Niveau 1',
        category: 'Spectacle',
        image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800',
        price: 10000,
        isFree: false
      },
      {
        _id: '8',
        title: 'Atelier Cuisine - Chef Invité',
        description: 'Cours de cuisine avec un chef étoilé',
        eventDateTime: new Date('2026-03-30T11:00:00'),
        location: 'Gourmet Palace - Niveau 3',
        category: 'Autre',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
        price: 30000,
        isFree: false
      }
    ];*/
    this.evenementsAffiches = [...this.evenements];
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

    // If category is just an ID string
    if (typeof catVal === 'string') {
      eventCatIdentifier = catVal;
    }
    // If category is a populated object
    else if (typeof catVal === 'object' && catVal !== null) {
      eventCatIdentifier = catVal._id ?? catVal.name;
    }

    const bonneCategorie =
      this.categorieChoisie === 'tous' ||
      eventCatIdentifier === this.categorieChoisie;

    const correspondRecherche =
      this.recherche === '' ||
      event.title.toLowerCase().includes(this.recherche.toLowerCase()) ||
      event.description.toLowerCase().includes(this.recherche.toLowerCase());

    return bonneCategorie && correspondRecherche;
  });
}

  toutReinitialiser(): void {
    this.categorieChoisie = 'tous';
    this.recherche = '';
    this.evenementsAffiches = [...this.evenements];
  }

  combienDansCetteCategorie(categorie: string): number {
    return this.evenements.filter(e =>
      (e.category as any)._id === categorie || e.category.name === categorie
    ).length;
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
}
