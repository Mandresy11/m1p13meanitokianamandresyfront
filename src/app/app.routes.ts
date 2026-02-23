import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ShopsComponent } from './features/shops/shops.component';
import { ShopDetailComponent } from './features/shops/shop-details/shop-detail.component'; // 🆕
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EventsComponent } from './features/events/events.component';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  // Page d'accueil
  {
    path: '',
    component: HomeComponent
  },

  // Page des boutiques (liste)
  {
    path: 'boutiques',
    component: ShopsComponent
  },

  // 🆕 Page de détail d'une boutique
  {
    path: 'boutiques/:id',
    component: ShopDetailComponent
  },

  // Page des événements
  {
    path: 'evenements',
    component: EventsComponent
  },

  // Dashboard admin
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [adminGuard]
  },

  // Redirection si la route n'existe pas
  {
    path: '**',
    redirectTo: ''
  }
];
