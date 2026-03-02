import { Injectable } from '@angular/core';
import { Observable, map, tap, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Event, EventCategory } from '../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventsService {

  private apiUrl = environment.apiUrl + '/api/events';
  private EventCache = new Map<string, Event>();

  constructor(private http: HttpClient) {}

  // READ

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

  // Catégories

  chargerLesCategories(): Observable<EventCategory[]> {
    return this.http.get<{ categories: EventCategory[] }>(
      `${this.apiUrl}/category/all`
    ).pipe(
      map(response => response.categories)
    );
  }

  // CREATE (admin)

  creerEvenement(formData: FormData): Observable<Event> {
    return this.http.post<{ event: Event }>(`${this.apiUrl}/add`, formData).pipe(
      map(response => response.event),
      tap(event => {
        if (event?._id) this.EventCache.set(event._id, event);
      })
    );
  }

  // UPDATE (admin)

  modifierEvenement(id: string, formData: FormData): Observable<Event> {
    return this.http.put<{ event: Event }>(`${this.apiUrl}/${id}`, formData).pipe(
      map(response => response.event),
      tap(event => {
        if (event?._id) this.EventCache.set(event._id, event);
      })
    );
  }

  // DELETE (admin)

  supprimerEvenement(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.EventCache.delete(id))
    );
  }

  // HELPERS
  filtrerparCategorie(categorie: string, evenements: Event[]): Event[] {
    if (categorie === 'tous') return evenements;
    return evenements.filter(e => e.category?.name === categorie);
  }

  viderCache(): void {
    this.EventCache.clear();
  }
}
