import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ShopsComponent } from './features/shops/shops.component';
import { ShopDetailComponent } from './features/shops/shop-details/shop-detail.component';
import { ShopFormComponent } from './features/shops/shop-form/shop-form.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EventsComponent } from './features/events/events.component';
import { EventDetailComponent } from './features/events/event-detail/event-detail.component';
import { EventFormComponent } from './features/events/event-form/event-form.component'; // ← NEW
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [

  // ── Page d'accueil
  { path: '', component: HomeComponent },

  // ── Boutiques
  { path: 'boutiques', component: ShopsComponent },
  {
    path: 'boutiques/ajouter',
    component: ShopFormComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'boutiques/:id/modifier',
    component: ShopFormComponent,
    canActivate: [adminGuard]
  },
  { path: 'boutiques/:id', component: ShopDetailComponent },

  // ── Événements
  { path: 'evenements', component: EventsComponent },

  {
    path: 'evenements/ajouter',
    component: EventFormComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'evenements/:id/modifier',
    component: EventFormComponent,
    canActivate: [adminGuard]
  },
  { path: 'evenements/:id', component: EventDetailComponent },

  // ── Dashboard admin
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [adminGuard]
  },

  // ── Fallback
  { path: '**', redirectTo: '' }
];
