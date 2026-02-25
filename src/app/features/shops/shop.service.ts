import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Category, Shop } from '../models/shop.model';
import { map, tap, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private apiUrl = environment.apiUrl + '/api/shops';
  private shopCache = new Map<string, Shop>();

  constructor(private http: HttpClient) {}

  // Récupérer toutes les boutiques
  chargerLesBoutiques(): Observable<Shop[]> {
    return this.http.get<{ shops: Shop[] }>(this.apiUrl).pipe(
      map(response => response.shops),
      tap(shops => {
        shops.forEach(shop => {
          if (shop._id) this.shopCache.set(shop._id, shop);
        });
      })
    );
  }

  //  Récupérer une boutique par ID
  obtenirBoutiqueParId(id: string): Observable<Shop> {
    if (this.shopCache.has(id)) {
      return of(this.shopCache.get(id)!);
    }
    return this.http.get<{ shop: Shop }>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.shop),
      tap(shop => {
        if (shop?._id) this.shopCache.set(id, shop);
      })
    );
  }


  chargerBoutiqueParId(id: string): Observable<Shop> {
    return this.obtenirBoutiqueParId(id);
  }

  //  Récupérer toutes les catégories
  chargerCategories(): Observable<Category[]> {
    return this.http.get<{ categories: Category[] }>(`${this.apiUrl}/category`).pipe(
      map(response => response.categories)
    );
  }

  // Créer une boutique (admin)
  creerBoutique(formData: FormData): Observable<Shop> {
    return this.http.post<{ shop: Shop }>(`${this.apiUrl}/add`, formData).pipe(
      map(response => response.shop)
    );
  }

  // Modifier une boutique (admin)
  modifierBoutique(id: string, formData: FormData): Observable<Shop> {
    return this.http.put<{ shop: Shop }>(`${this.apiUrl}/${id}`, formData).pipe(
      map(response => response.shop),
      tap(shop => {
        if (shop?._id) this.shopCache.set(shop._id, shop); // Mettre à jour le cache
      })
    );
  }

  // Supprimer une boutique (admin)
  supprimerBoutique(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`).pipe(
      tap(() => {
        this.shopCache.delete(id); // Vider le cache pour cette boutique
      })
    );
  }

  // ─── Filtrer par catégorie (local) ────────────────────────────────────────
  filtrerparCategorie(categorie: string, boutiques: Shop[]): Shop[] {
    if (categorie === 'tout') return boutiques;
    return boutiques.filter(b => b.category?.name === categorie);
  }
}
