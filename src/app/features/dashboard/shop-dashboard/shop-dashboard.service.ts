import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

export interface OrderItem {
  product: string;
  shop: string;
  quantity: number;
  priceAtOrder: number;
  productName: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: { _id: string; username: string; fullname: string };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  note: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ShopDashboardService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getShopOrders(): Observable<Order[]> {
    return this.http
      .get<{ orders: Order[] }>(`${this.apiUrl}/api/orders`)
      .pipe(map(res => res.orders));
  }

  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    return this.http
      .put<{ order: Order }>(`${this.apiUrl}/api/orders/${orderId}/status`, { status })
      .pipe(map(res => res.order));
  }
}
