import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalCollectionsDetailsComponent } from './legal-collections-details.component';

describe('LegalCollectionsDetailsComponent', () => {
  let component: LegalCollectionsDetailsComponent;
  let fixture: ComponentFixture<LegalCollectionsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LegalCollectionsDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalCollectionsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
