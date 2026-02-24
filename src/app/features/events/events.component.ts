import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Event, EventCategory } from '../models/event.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // RouterLink ajouté
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  evenements: Event[] = [];
  evenementsAffiches: Event[] = [];
  categories = Object.values(EventCategory);
  categorieChoisie: string = 'tous';
  recherche: string = '';

  ngOnInit(): void {
    this.chargerLesEvenements();
  }

  chargerLesEvenements(): void {
    this.evenements = [
      {
        _id: '1',
        title: 'Soirée DJ - Summer Vibes',
        description: 'Soirée musicale avec les meilleurs DJs de la capitale',
        date: '2026-02-28',
        time: '20h00',
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
        date: '2026-03-01',
        time: '10h00',
        location: 'Galerie d\'art - Niveau 2',
        category: 'Exposition',
        image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800',
        isFree: true
      },
      {
        _id: '3',
        title: 'Défilé de Mode - Printemps 2026',
        description: 'Présentation des nouvelles collections printemps-été',
        date: '2026-03-05',
        time: '18h00',
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
        date: '2026-03-10',
        time: '09h00',
        location: 'Toutes les boutiques Mode',
        category: 'Vente privée',
        image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800',
        isFree: true
      },
      {
        _id: '5',
        title: 'Animation Enfants - Magie & Cirque',
        description: 'Spectacle de magie et numéros de cirque pour les enfants',
        date: '2026-03-15',
        time: '14h00',
        location: 'Espace enfants - Niveau 2',
        category: 'Animation',
        image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800',
        isFree: true
      },
      {
        _id: '6',
        title: 'Concert Acoustique - Jazz Night',
        description: 'Soirée jazz avec des musiciens internationaux',
        date: '2026-03-20',
        time: '19h30',
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
        date: '2026-03-25',
        time: '16h00',
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
        date: '2026-03-30',
        time: '11h00',
        location: 'Gourmet Palace - Niveau 3',
        category: 'Autre',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
        price: 30000,
        isFree: false
      }
    ];
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
      const bonneCategorie = this.categorieChoisie === 'tous' || event.category === this.categorieChoisie;
      const correspondRecherche = this.recherche === '' ||
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
    return this.evenements.filter(e => e.category === categorie).length;
  }

  formaterDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  getMoisAbbr(dateStr: string): string {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return mois[parseInt(dateStr.split('-')[1], 10) - 1] ?? '';
  }

  getJour(dateStr: string): string {
    return dateStr.split('-')[2];
  }
}
