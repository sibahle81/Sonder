import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalAdminComponent } from './legal-admin.component';

describe('LegalAdminComponent', () => {
  let component: LegalAdminComponent;
  let fixture: ComponentFixture<LegalAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LegalAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
