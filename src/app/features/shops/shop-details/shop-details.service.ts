import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

export interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShopDetailsService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Récupérer les produits d'une boutique
  getProductsByShop(shopId: string): Observable<Product[]> {
    return this.http
      .get<{ products: Product[] }>(`${this.apiUrl}/api/products/shop/${shopId}`)
      .pipe(map(res => res.products));
  }

  // Récupérer toutes les catégories produit
  getCategories(): Observable<ProductCategory[]> {
    return this.http
      .get<{ categories: ProductCategory[] }>(`${this.apiUrl}/api/products/categories`)
      .pipe(map(res => res.categories));
  }

  // Ajouter un produit
  addProduct(formData: FormData): Observable<Product> {
    return this.http
      .post<{ product: Product }>(`${this.apiUrl}/api/products/add`, formData)
      .pipe(map(res => res.product));
  }

  // Modifier un produit
  updateProduct(productId: string, formData: FormData): Observable<Product> {
    return this.http
      .put<{ product: Product }>(`${this.apiUrl}/api/products/${productId}`, formData)
      .pipe(map(res => res.product));
  }

  // Supprimer un produit
  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/products/${productId}`);
  }
}
