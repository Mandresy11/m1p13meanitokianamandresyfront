import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ShopsComponent } from './features/shops/shops.component';
import { ShopDetailComponent } from './features/shops/shop-details/shop-detail.component';
import { ShopFormComponent } from './features/shops/shop-form/shop-form.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ShopDashboardComponent } from './features/dashboard/shop-dashboard/shop-dashboard.component';
import { EventsComponent } from './features/events/events.component';
import { EventDetailComponent } from './features/events/event-detail/event-detail.component';
import { EventFormComponent } from './features/events/event-form/event-form.component';
import { GoogleCallbackComponent } from './features/auth/google-callback/google-callback.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { adminGuard } from './guards/admin-guard';
import { shopGuard } from './guards/shop-guard';

export const routes: Routes = [
  { path: '',                   component: HomeComponent },
  { path: 'boutiques',          component: ShopsComponent },
  { path: 'boutiques/ajouter',  component: ShopFormComponent, canActivate: [adminGuard] },
  { path: 'boutiques/:id/modifier', component: ShopFormComponent, canActivate: [adminGuard] },
  { path: 'boutiques/:id',      component: ShopDetailComponent },
  { path: 'evenements',         component: EventsComponent },
  { path: 'evenements/ajouter',     component: EventFormComponent, canActivate: [adminGuard] },  // ← AVANT :id
  { path: 'evenements/:id/modifier', component: EventFormComponent, canActivate: [adminGuard] },
  { path: 'evenements/:id',     component: EventDetailComponent },
  { path: 'dashboard',          component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'shop-dashboard',     component: ShopDashboardComponent, canActivate: [shopGuard] },
  { path: 'auth/google/success',  component: GoogleCallbackComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },

  { path: '**', redirectTo: '' }
];
