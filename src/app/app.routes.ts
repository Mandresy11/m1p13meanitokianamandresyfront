import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ShopsComponent } from './features/shops/shops.component';
import { ShopDetailComponent } from './features/shops/shop-details/shop-detail.component';
import { ShopFormComponent } from './features/shops/shop-form/shop-form.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EventsComponent } from './features/events/events.component';
import { EventDetailComponent } from './features/events/event-detail/event-detail.component';
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



  {
    path: 'boutiques/ajouter',
    component: ShopFormComponent,
    canActivate: [adminGuard]
  },

  // Modifier une boutique existante
  {
    path: 'boutiques/:id/modifier',
    component: ShopFormComponent,
    canActivate: [adminGuard]
  },

  // Page de détail d'une boutique
  {
    path: 'boutiques/:id',
    component: ShopDetailComponent
  },

  // Page des événements (liste)
  {
    path: 'evenements',
    component: EventsComponent
  },

  // Page de détail d'un événement
  {
    path: 'evenements/:id',
    component: EventDetailComponent
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
