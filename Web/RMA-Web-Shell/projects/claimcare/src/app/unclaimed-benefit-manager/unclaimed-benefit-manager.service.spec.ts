import { TestBed } from '@angular/core/testing';

import { UnclaimedBenefitManagerService } from './unclaimed-benefit-manager.service';

describe('UnclaimedBenefitManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UnclaimedBenefitManagerService = TestBed.inject(UnclaimedBenefitManagerService);
    expect(service).toBeTruthy();
  });
});
