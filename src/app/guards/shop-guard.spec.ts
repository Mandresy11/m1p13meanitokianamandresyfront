import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { shopGuard } from './shop-guard';

describe('shopGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => shopGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
