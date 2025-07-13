import { TestBed } from '@angular/core/testing';

import { UnclaimBnefitsValuesService } from './unclaim-bnefits-values.service';

describe('UnclaimBnefitsValuesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UnclaimBnefitsValuesService = TestBed.inject(UnclaimBnefitsValuesService);
    expect(service).toBeTruthy();
  });
});
