import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Category, Shop } from '../models/shop.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private apiUrl = environment.apiUrl + '/api/shops';

  constructor(private http: HttpClient) {}

  chargerLesCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/category`);
  }

  chargerLesBoutiques(): Observable<Shop[]> {
    return this.http.get<{ shops: Shop[] }>(this.apiUrl)
    .pipe(map(response => response.shops));
  }

  filtrerparCategorie(categorie: string, boutiques: Shop[]): Shop[] {
    if (categorie === 'tout') {
      return boutiques;
    }
    return boutiques.filter(boutique => boutique.category.name === categorie);
  }
}
