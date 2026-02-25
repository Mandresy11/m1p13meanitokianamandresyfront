import { Injectable } from '@angular/core';
import { Observable, map, tap, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private apiUrl = environment.apiUrl + '/api/events';
  private EventCache = new Map<string, Event>();

  constructor(private http: HttpClient) {}

  // Récupérer tous les événements
  chargerLesEvenements(): Observable<Event[]> {
    return this.http.get<{ events: Event[] }>(this.apiUrl).pipe(
      map(response => response.events),
      tap(events => {
        events.forEach(event => {
          if (event._id) this.EventCache.set(event._id, event);
        });
      })
    );
  }

  obtenirEvenementParId(id: string): Observable<Event> {
    if (this.EventCache.has(id)) {
      return of(this.EventCache.get(id)!);
    }
    return this.http.get<{ event: Event }>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.event),
      tap(event => {
        if (event?._id) this.EventCache.set(id, event);
      })
    );
  }

  filtrerparCategorie(categorie: string, evenements: Event[]): Event[] {
    if (categorie === 'tous') return evenements;
    return evenements.filter(e => e.category?.name === categorie);
  }
}
