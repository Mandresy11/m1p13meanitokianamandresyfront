import { TestBed } from '@angular/core/testing';

import { ShopDashboardService } from './shop-dashboard.service';

describe('ShopDashboardService', () => {
  let service: ShopDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShopDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
