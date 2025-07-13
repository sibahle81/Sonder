import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalCollectionsAdminComponent } from './legal-collections-admin.component';

describe('LegalCollectionsAdminComponent', () => {
  let component: LegalCollectionsAdminComponent;
  let fixture: ComponentFixture<LegalCollectionsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LegalCollectionsAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalCollectionsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
