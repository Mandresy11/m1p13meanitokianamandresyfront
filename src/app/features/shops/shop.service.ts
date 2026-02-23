import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Shop } from '../models/shop.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private apiUrl = environment.apiUrl + '/api/shops';

  constructor(private http: HttpClient) {}

  chargerLesBoutiques(): Observable<Shop[]> {
    return this.http.get<{ shops: Shop[] }>(this.apiUrl)
    .pipe(map(response => response.shops));
  }
}
