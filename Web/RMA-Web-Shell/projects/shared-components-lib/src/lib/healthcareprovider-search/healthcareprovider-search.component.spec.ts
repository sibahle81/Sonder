import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthcareProviderSearchComponent } from './healthcareprovider-search.component';

describe('HealthcareproviderSearchComponent', () => {
  let component: HealthcareProviderSearchComponent;
  let fixture: ComponentFixture<HealthcareProviderSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HealthcareProviderSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthcareProviderSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
