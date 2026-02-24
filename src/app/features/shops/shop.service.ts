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

  chargerBoutiqueParId(id: string): Observable<Shop> {
    if (this.shopCache.has(id)) {
      return of(this.shopCache.get(id)!);  // return cached data
    }
    return this.http.get<{ shop: Shop }>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.shop),
      tap(shop => {
        if (shop && shop._id) this.shopCache.set(id, shop);
      })
    );
  }

   filtrerparCategorie(categorie: string, boutiques: Shop[]): Shop[] {
    if (categorie === 'tout') {
      return boutiques;
    }
    return boutiques.filter(
      boutique => boutique.category?.name === categorie
    );
  }
}
