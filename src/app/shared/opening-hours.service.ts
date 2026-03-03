import { Injectable } from '@angular/core';
import { OpeningHour } from '../features/models/shop.model';

export interface ShopStatus {
  isOpen: boolean;
  label: string;
  nextInfo: string;      color: 'green' | 'red' | 'orange';
}

@Injectable({
  providedIn: 'root'
})
export class OpeningHoursService {


  getStatus(openingHours?: OpeningHour[]): ShopStatus {

    // Pas d'horaires renseignés
    if (!openingHours || openingHours.length === 0) {
      return {
        isOpen: false,
        label: 'Horaires non renseignés',
        nextInfo: '',
        color: 'orange'
      };
    }

    const now    = new Date();
    const today  = now.getDay();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    const todayHours = openingHours.find(h => h.day === today);

    // Fermé ce jour
    if (!todayHours || !todayHours.isOpen || todayHours.periods.length === 0) {
      const nextOpen = this.getNextOpenDay(openingHours, today);
      return {
        isOpen: false,
        label: 'Fermé',
        nextInfo: nextOpen,
        color: 'red'
      };
    }

    // Vérifier si on est dans un créneau ouvert
    for (const period of todayHours.periods) {
      const openMin  = this.timeToMinutes(period.open);
      const closeMin = this.timeToMinutes(period.close);

      if (nowMin >= openMin && nowMin < closeMin) {
        const fermetureIn = closeMin - nowMin;
        const closeSoon   = fermetureIn <= 30;

        return {
          isOpen: true,
          label: 'Ouvert',
          nextInfo: `Ferme à ${period.close}`,
          color: closeSoon ? 'orange' : 'green'
        };
      }
    }

    // On est entre deux créneaux ou après fermeture
    // Chercher le prochain créneau aujourd'hui
    const nextPeriod = todayHours.periods.find(p => this.timeToMinutes(p.open) > nowMin);
    if (nextPeriod) {
      return {
        isOpen: false,
        label: 'Fermé',
        nextInfo: `Ouvre à ${nextPeriod.open}`,
        color: 'red'
      };
    }

    // Plus de créneau aujourd'hui, chercher le prochain jour
    const nextOpen = this.getNextOpenDay(openingHours, today);
    return {
      isOpen: false,
      label: 'Fermé',
      nextInfo: nextOpen,
      color: 'red'
    };
  }

  // Helpers privés

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private getNextOpenDay(openingHours: OpeningHour[], fromDay: number): string {
    const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

    for (let i = 1; i <= 7; i++) {
      const nextDay     = (fromDay + i) % 7;
      const nextHours   = openingHours.find(h => h.day === nextDay);

      if (nextHours && nextHours.isOpen && nextHours.periods.length > 0) {
        const firstPeriod = nextHours.periods[0];
        const label       = i === 1 ? 'demain' : dayNames[nextDay];
        return `Ouvre ${label} à ${firstPeriod.open}`;
      }
    }

    return 'Horaires non disponibles';
  }
}
