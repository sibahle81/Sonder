import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandler } from './global-error-handler.service';

describe('GlobalErrorHandler', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlobalErrorHandler = TestBed.inject(GlobalErrorHandler);
    expect(service).toBeTruthy();
  });
});