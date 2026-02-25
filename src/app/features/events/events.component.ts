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
