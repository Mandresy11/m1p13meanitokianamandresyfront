import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ShopDashboardService, Order } from './shop-dashboard.service';
import { ShopDetailsService, Product } from '../../shops/shop-details/shop-details.service';
import { ShopService } from '../../shops/shop.service';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-shop-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './shop-dashboard.component.html',
  styleUrl: './shop-dashboard.component.css',
})
export class ShopDashboardComponent implements OnInit {

  shopId = '';
  shopName = '';
  shopLogo = '';
  adminName = '';
  greetingHour = '';
  currentDate = '';

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  products: Product[] = [];

  isLoading = true;
  hasError = false;
  activeTab: 'orders' | 'products' = 'orders';
  statusFilter = 'all';
  searchQuery = '';

  storageUrl = environment.apiUrl;

  readonly statusLabels: Record<string, string> = {
    pending:   '⏳ En attente',
    confirmed: '✅ Confirmée',
    preparing: '👨‍🍳 En préparation',
    ready:     '📦 Prête',
    delivered: '🚀 Livrée',
    cancelled: '❌ Annulée',
  };

  readonly statusColors: Record<string, string> = {
    pending:   'status-pending',
    confirmed: 'status-confirmed',
    preparing: 'status-preparing',
    ready:     'status-ready',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
  };

  constructor(
    private shopDashboardService: ShopDashboardService,
    private shopDetailsService: ShopDetailsService,
    private shopService: ShopService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initGreeting();
    // Get shopId from localStorage (saved at login)
    const raw = localStorage.getItem('shopId');
    this.shopId = raw ? JSON.parse(raw) : '';
    this.loadData();
  }

  private initGreeting(): void {
    const now = new Date();
    const h = now.getHours();
    this.greetingHour = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
    const raw = localStorage.getItem('utilisateur');
    this.adminName = raw ? JSON.parse(raw) : 'Gérant';
    const dateStr = now.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    this.currentDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      orders:   this.shopDashboardService.getShopOrders(),
      products: this.shopDetailsService.getProductsByShop(this.shopId),
    }).subscribe({
      next: ({ orders, products }) => {
        // Filter orders for this shop only
        this.orders = orders.filter(o =>
          o.items.some(item => item.shop === this.shopId)
        );
        this.filteredOrders = [...this.orders];
        this.products = products.map(p => ({
          ...p,
          image: p.image ? this.storageUrl + p.image : 'assets/placeholder.png'
        }));

        // Get shop name
        if (this.shopId) {
          this.shopService.obtenirBoutiqueParId(this.shopId).subscribe({
            next: (shop) => {
              this.shopName = shop.name;
              this.shopLogo = shop.logo ? this.storageUrl + shop.logo : '';
              this.cdr.detectChanges();
            }
          });
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── KPIs
  get totalOrders(): number { return this.orders.length; }
  get pendingOrders(): number { return this.orders.filter(o => o.status === 'pending').length; }
  get totalRevenue(): number {
    return this.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }
  get totalProducts(): number { return this.products.length; }

  // ── Filters
  applyFilters(): void {
    let result = [...this.orders];
    if (this.statusFilter !== 'all') {
      result = result.filter(o => o.status === this.statusFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.user?.username?.toLowerCase().includes(q)
      );
    }
    this.filteredOrders = result;
  }

  onStatusFilter(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  onSearch(event: globalThis.Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  updateStatus(orderId: string, status: string): void {
    this.shopDashboardService.updateOrderStatus(orderId, status).subscribe({
      next: (updated) => {
        const idx = this.orders.findIndex(o => o._id === orderId);
        if (idx !== -1) {
          this.orders[idx] = updated;
          this.orders = [...this.orders];
          this.applyFilters();
        }
        this.cdr.detectChanges();
      }
    });
  }

  getShopItems(order: Order): OrderItem[] {
    return order.items.filter(item => item.shop === this.shopId);
  }

  retry(): void { this.loadData(); }

  setTab(tab: 'orders' | 'products'): void {
    this.activeTab = tab;
  }
}

// Re-export for template use
interface OrderItem {
  product: string;
  shop: string;
  quantity: number;
  priceAtOrder: number;
  productName: string;
}
