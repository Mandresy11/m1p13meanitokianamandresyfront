import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter }            from '@angular/router';
import { provideHttpClient }        from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError }           from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { ShopService }         from '../shops/shop.service';
import { AuthService }         from '../auth/auth.service';
import { EventsService }       from '../events/events.service';

// Mock boutiques
const mockShops = [
  {
    _id: '1',
    name: 'Nike Store',
    description: 'Chaussures et vêtements de sport',
    location: { level: 1, section: 'A' },
    category: { _id: 'c1', name: 'Mode', icon: '👗', description: '' },
    logo: '',
    phoneNumber: ''
  },
  {
    _id: '2',
    name: 'Apple Premium Reseller',
    description: 'Produits Apple officiels',
    location: { level: 2, section: 'B' },
    category: { _id: 'c2', name: 'High-Tech', icon: '💻', description: '' },
    logo: '',
    phoneNumber: ''
  },
  {
    _id: '3',
    name: 'Zara',
    description: 'Mode et accessoires',
    location: { level: 1, section: 'C' },
    category: { _id: 'c1', name: 'Mode', icon: '👗', description: '' },
    logo: '',
    phoneNumber: ''
  }
];

//  Mock catégories
const mockCategories = [
  { _id: 'c1', name: 'Mode',      icon: '👗', description: 'Vêtements et accessoires' },
  { _id: 'c2', name: 'High-Tech', icon: '💻', description: 'Électronique et gadgets'  }
];

//  Mock événements
// On crée 3 événements : 2 dans le futur, 1 dans le passé
const futureDate1 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(); // +3 jours
const futureDate2 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(); // +10 jours
const pastDate    = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString();  // -5 jours

const mockEvents = [
  {
    _id: 'e1',
    title: 'Soldes d\'été',
    description: 'Grandes promotions',
    eventDateTime: futureDate1,
    location: 'Hall principal',
    category: { _id: 'cat1', name: 'Promotions', description: '' },
    shop: { _id: '1', name: 'Nike Store', location: { level: 1, section: 'A' } },
    isFree: true,
    price: 0
  },
  {
    _id: 'e2',
    title: 'Concert Live',
    description: 'Soirée musicale',
    eventDateTime: futureDate2,
    location: 'Atrium',
    category: { _id: 'cat2', name: 'Musique', description: '' },
    shop: { _id: '2', name: 'Apple Premium Reseller', location: { level: 2, section: 'B' } },
    isFree: false,
    price: 15
  },
  {
    _id: 'e3',
    title: 'Événement passé',
    description: 'Cet événement est déjà terminé',
    eventDateTime: pastDate,
    location: 'Niveau 2',
    category: { _id: 'cat1', name: 'Promotions', description: '' },
    shop: { _id: '3', name: 'Zara', location: { level: 1, section: 'C' } },
    isFree: true,
    price: 0
  }
];

//  Mocks services
const shopServiceMock = {
  chargerLesBoutiques: vi.fn(() => of(mockShops)),
  chargerCategories:   vi.fn(() => of(mockCategories))
};

const authServiceMock = {
  utilisateur$: of(null),
  obtenirRole:  vi.fn(() => 'admin'),
  estAdmin:     vi.fn(() => true)
};

const eventsServiceMock = {
  chargerLesEvenements: vi.fn(() => of(mockEvents))
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture:   ComponentFixture<DashboardComponent>;

  //  Configuration du module de test
  beforeEach(async () => {

    vi.clearAllMocks();
    shopServiceMock.chargerLesBoutiques.mockReturnValue(of(mockShops));
    shopServiceMock.chargerCategories.mockReturnValue(of(mockCategories));
    eventsServiceMock.chargerLesEvenements.mockReturnValue(of(mockEvents));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ShopService,   useValue: shopServiceMock   },
        { provide: AuthService,   useValue: authServiceMock   },
        { provide: EventsService, useValue: eventsServiceMock }
      ]
    }).compileComponents();

    // Simule un utilisateur connecté
    localStorage.setItem('utilisateur', JSON.stringify('Admin'));

    fixture   = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // CRÉATION DU COMPOSANT

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  // CHARGEMENT DES DONNÉES — BOUTIQUES

  it('devrait appeler chargerLesBoutiques au démarrage', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(shopServiceMock.chargerLesBoutiques).toHaveBeenCalledTimes(1);
  }));

  it('devrait appeler chargerCategories au démarrage', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(shopServiceMock.chargerCategories).toHaveBeenCalledTimes(1);
  }));

  it('devrait charger 3 boutiques depuis le service', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.boutiques.length).toBe(3);
  }));

  it('devrait charger 2 catégories depuis le service', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.categories.length).toBe(2);
  }));

  it('devrait passer isLoading à false après le chargement', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.isLoading).toBe(false);
  }));

  it('devrait initialiser boutiquesFiltered avec toutes les boutiques', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.boutiquesFiltered.length).toBe(component.boutiques.length);
  }));

  it('devrait remplir boutiquesRecentes avec maximum 5 boutiques', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.boutiquesRecentes.length).toBeLessThanOrEqual(5);
  }));

  // CHARGEMENT DES DONNÉES — ÉVÉNEMENTS

  it('devrait appeler chargerLesEvenements au démarrage', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(eventsServiceMock.chargerLesEvenements).toHaveBeenCalledTimes(1);
  }));

  it('devrait charger 3 événements depuis le service', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.evenements.length).toBe(3);
  }));

  it('devrait ne garder que les événements futurs dans evenementsAVenir', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    // 2 événements futurs sur 3
    expect(component.evenementsAVenir.length).toBe(2);
  }));

  it('devrait trier evenementsAVenir par date croissante', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const dates = component.evenementsAVenir.map(e => new Date(e.eventDateTime).getTime());
    expect(dates[0]).toBeLessThan(dates[1]);
  }));

  it('devrait limiter evenementsAVenir à 4 maximum', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.evenementsAVenir.length).toBeLessThanOrEqual(4);
  }));

  it('ne devrait pas inclure l\'événement passé dans evenementsAVenir', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const ids = component.evenementsAVenir.map(e => e._id);
    expect(ids).not.toContain('e3');
  }));

  it('devrait inclure les événements futurs dans evenementsAVenir', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const ids = component.evenementsAVenir.map(e => e._id);
    expect(ids).toContain('e1');
    expect(ids).toContain('e2');
  }));

  // KPI CARDS

  it('devrait construire exactement 4 KPI cards', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.statCards.length).toBe(4);
  }));

  it('la 1re KPI card affiche le nombre total de boutiques', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.statCards[0].value).toBe(3);
  }));

  it('la 2e KPI card affiche le nombre de catégories', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.statCards[1].value).toBe(2);
  }));

  it('la 3e KPI card affiche le nombre total d\'événements', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    // 3 événements au total (passés + futurs)
    expect(component.statCards[2].value).toBe(3);
  }));

  it('la 3e KPI card doit avoir l\'icône 📅', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.statCards[2].icon).toBe('📅');
  }));

  it('la 3e KPI card doit avoir le gradient gradient-pink', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.statCards[2].gradient).toBe('gradient-pink');
  }));

  it('la 4e KPI card affiche les niveaux couverts', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    // boutiques sur niveaux 1 et 2 → 2 niveaux distincts
    expect(component.statCards[3].value).toBe(2);
  }));

  // STATS PAR CATÉGORIE

  it('devrait calculer au moins une stat de catégorie', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.categoryStats.length).toBeGreaterThan(0);
  }));

  it('devrait trier les catégories par nombre décroissant', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.categoryStats[0].name).toBe('Mode');
  }));

  it('les pourcentages des catégories doivent être entre 0 et 100', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.categoryStats.forEach(cat => {
      expect(cat.percent).toBeGreaterThanOrEqual(0);
      expect(cat.percent).toBeLessThanOrEqual(100);
    });
  }));

  // INITIALES ET COULEURS

  it('devrait calculer les initiales pour un nom à 2 mots (Nike Store → NS)', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const nikeRow = component.boutiques.find(b => b._id === '1');
    expect(nikeRow?.initials).toBe('NS');
  }));

  it('devrait calculer les initiales pour un nom à 1 mot (Zara → ZA)', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const zaraRow = component.boutiques.find(b => b._id === '3');
    expect(zaraRow?.initials).toBe('ZA');
  }));

  it('devrait attribuer une couleur hex valide à chaque boutique', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.boutiques.forEach(b => {
      expect(b.color).toBeTruthy();
      expect(b.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  }));

  // SALUTATION DYNAMIQUE

  it('devrait récupérer le nom admin depuis localStorage', () => {
    expect(component.adminName).toBe('Admin');
  });

  it('devrait définir une salutation valide', () => {
    const salutationsValides = ['Bonjour', 'Bon après-midi', 'Bonsoir'];
    expect(salutationsValides).toContain(component.greetingHour);
  });

  it('devrait définir une date courante non vide', () => {
    expect(component.currentDate.length).toBeGreaterThan(0);
  });

  // RECHERCHE EN TEMPS RÉEL

  it('devrait filtrer les boutiques par nom', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.onSearch({ target: { value: 'nike' } } as unknown as globalThis.Event);
    expect(component.boutiquesFiltered.length).toBe(1);
    expect(component.boutiquesFiltered[0].name).toBe('Nike Store');
  }));

  it('devrait filtrer les boutiques par catégorie', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.onSearch({ target: { value: 'mode' } } as unknown as globalThis.Event);
    expect(component.boutiquesFiltered.length).toBe(2);
  }));

  it('devrait afficher 0 résultat pour une recherche sans correspondance', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.onSearch({ target: { value: 'xxxxxxinexistant' } } as unknown as globalThis.Event);
    expect(component.boutiquesFiltered.length).toBe(0);
  }));

  it('devrait réafficher toutes les boutiques si la recherche est vidée', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.onSearch({ target: { value: 'nike' } } as unknown as globalThis.Event);
    expect(component.boutiquesFiltered.length).toBe(1);
    component.onSearch({ target: { value: '' } } as unknown as globalThis.Event);
    expect(component.boutiquesFiltered.length).toBe(3);
  }));

  it('devrait mettre à jour searchQuery', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    component.onSearch({ target: { value: 'apple' } } as unknown as globalThis.Event);
    expect(component.searchQuery).toBe('apple');
  }));

  // HELPERS DATES

  it('getJour() devrait retourner le jour du mois en string', () => {
    const date = new Date('2025-07-14T10:00:00');
    expect(component.getJour(date)).toBe('14');
  });

  it('getMoisAbbr() devrait retourner le mois abrégé en majuscules', () => {
    const date = new Date('2025-01-14T10:00:00');
    const result = component.getMoisAbbr(date);
    expect(result).toBeTruthy();
    expect(result).toBe(result.toUpperCase());
  });

  it('getHeure() devrait retourner une heure formatée avec h', () => {
    const date = new Date('2025-07-14T14:30:00');
    const result = component.getHeure(date);
    expect(result).toContain('h');
  });

  // GESTION DES ERREURS

  it('devrait passer hasError à true si le service boutiques échoue', fakeAsync(() => {
    shopServiceMock.chargerLesBoutiques.mockReturnValue(
      throwError(() => new Error('Serveur indisponible'))
    );
    shopServiceMock.chargerCategories.mockReturnValue(
      throwError(() => new Error('Serveur indisponible'))
    );
    eventsServiceMock.chargerLesEvenements.mockReturnValue(
      throwError(() => new Error('Serveur indisponible'))
    );

    fixture   = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.hasError).toBe(true);
    expect(component.isLoading).toBe(false);
  }));

  it('devrait passer hasError à true si le service events échoue', fakeAsync(() => {
    eventsServiceMock.chargerLesEvenements.mockReturnValue(
      throwError(() => new Error('Events indisponibles'))
    );

    fixture   = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.hasError).toBe(true);
    expect(component.isLoading).toBe(false);
  }));

  it('devrait passer hasError à false au démarrage normal', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    expect(component.hasError).toBe(false);
  }));

  // RETRY

  it('devrait relancer le chargement avec retry()', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    component.hasError  = true;
    component.boutiques = [];
    component.evenements = [];

    component.retry();
    tick();
    fixture.detectChanges();

    expect(component.hasError).toBe(false);
    expect(component.boutiques.length).toBe(3);
    expect(component.evenements.length).toBe(3);
  }));

  // NETTOYAGE RXJS

  it('devrait appeler next sur destroy$ lors de la destruction', () => {
    const nextSpy = vi.spyOn((component as any).destroy$, 'next');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
  });

  it('devrait appeler complete sur destroy$ lors de la destruction', () => {
    const completeSpy = vi.spyOn((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect(completeSpy).toHaveBeenCalled();
  });

});
