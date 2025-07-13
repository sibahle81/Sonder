import { TestBed } from '@angular/core/testing';

import { UserPreferenceService } from './userpreferenceservice.service';

describe('UserpreferenceserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserPreferenceService = TestBed.inject(UserPreferenceService);
    expect(service).toBeTruthy();
  });
});