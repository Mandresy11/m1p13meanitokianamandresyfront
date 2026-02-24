import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

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

  eventId: string = '';
  event: EventDetail | null = null;
  evenementsSimilaires: EventDetail[] = []; // 🆕

  private tousLesEvenements: EventDetail[] = [
    {
      _id: '1', title: 'Soirée DJ - Summer Vibes',
      description: 'Soirée musicale avec les meilleurs DJs de la capitale. Une nuit inoubliable vous attend avec des sets électroniques et house music jusqu\'au bout de la nuit.',
      date: '2026-02-28', time: '20h00', location: 'Espace événementiel - Niveau 3',
      category: 'Concert', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
      price: 15000, isFree: false
    },
    {
      _id: '2', title: 'Exposition Art Contemporain',
      description: 'Découvrez les œuvres d\'artistes locaux talentueux. Peintures, sculptures et installations numériques exposées dans notre galerie pendant tout le mois de mars.',
      date: '2026-03-01', time: '10h00', location: 'Galerie d\'art - Niveau 2',
      category: 'Exposition', image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=1200',
      isFree: true
    },
    {
      _id: '3', title: 'Défilé de Mode - Printemps 2026',
      description: 'Présentation des nouvelles collections printemps-été par les boutiques du MegaMall. Venez découvrir les dernières tendances mode en avant-première.',
      date: '2026-03-05', time: '18h00', location: 'Scène centrale - Niveau 1',
      category: 'Défilé de mode', image: 'https://images.unsplash.com/photo-1558769132-cb1aea1f5140?w=1200',
      price: 25000, isFree: false
    },
    {
      _id: '4', title: 'Ventes Privées - Mode & Accessoires',
      description: 'Jusqu\'à -70% sur une sélection d\'articles mode et accessoires. Réservé aux membres premium du MegaMall. Inscription gratuite sur place.',
      date: '2026-03-10', time: '09h00', location: 'Toutes les boutiques Mode',
      category: 'Vente privée', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200',
      isFree: true
    },
    {
      _id: '5', title: 'Animation Enfants - Magie & Cirque',
      description: 'Spectacle de magie et numéros de cirque pour émerveiller les enfants. Jongleurs, magiciens et clowns seront au rendez-vous pour un après-midi magique.',
      date: '2026-03-15', time: '14h00', location: 'Espace enfants - Niveau 2',
      category: 'Animation', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=1200',
      isFree: true
    },
    {
      _id: '6', title: 'Concert Acoustique - Jazz Night',
      description: 'Soirée jazz avec des musiciens internationaux dans une ambiance feutrée et élégante. Réservation conseillée, places limitées à 200 personnes.',
      date: '2026-03-20', time: '19h30', location: 'Food Court - Niveau 3',
      category: 'Concert', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200',
      price: 20000, isFree: false
    },
    {
      _id: '7', title: 'Spectacle de Danse - Urban Dance',
      description: 'Compétition de danse hip-hop et breakdance ouverte à tous les âges. 12 équipes s\'affrontent pour le titre de champion du MegaMall 2026.',
      date: '2026-03-25', time: '16h00', location: 'Scène centrale - Niveau 1',
      category: 'Spectacle', image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=1200',
      price: 10000, isFree: false
    },
    {
      _id: '8', title: 'Atelier Cuisine - Chef Invité',
      description: 'Cours de cuisine avec un chef étoilé. Apprenez à réaliser 3 recettes gastronomiques. Matériel et ingrédients fournis. Tablier offert aux participants.',
      date: '2026-03-30', time: '11h00', location: 'Gourmet Palace - Niveau 3',
      category: 'Autre', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200',
      price: 30000, isFree: false
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    this.event   = this.tousLesEvenements.find(e => e._id === this.eventId) || null;

    // Charger 3 événements similaires (même catégorie, sans l'actuel)
    if (this.event) {
      this.evenementsSimilaires = this.tousLesEvenements
        .filter(e => e._id !== this.eventId && e.category === this.event!.category)
        .slice(0, 3);

      // Si pas assez dans la même catégorie, compléter avec d'autres
      if (this.evenementsSimilaires.length < 3) {
        const autres = this.tousLesEvenements
          .filter(e => e._id !== this.eventId && e.category !== this.event!.category)
          .slice(0, 3 - this.evenementsSimilaires.length);
        this.evenementsSimilaires = [...this.evenementsSimilaires, ...autres];
      }
    }
  }

  formaterDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  getMoisAbbr(dateStr: string): string {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return mois[parseInt(dateStr.split('-')[1], 10) - 1] ?? '';
  }

  getJour(dateStr: string): string {
    return dateStr.split('-')[2];
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
