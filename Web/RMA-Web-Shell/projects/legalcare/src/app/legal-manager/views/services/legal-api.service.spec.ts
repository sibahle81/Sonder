import { TestBed } from '@angular/core/testing';

import { LegalApiService } from './legal-api.service';

describe('LegalApiService', () => {
  let service: LegalApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LegalApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
