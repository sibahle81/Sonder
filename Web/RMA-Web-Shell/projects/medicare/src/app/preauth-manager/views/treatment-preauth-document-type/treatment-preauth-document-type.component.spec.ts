import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentPreauthDocumentTypeComponent } from './treatment-preauth-document-type.component';

describe('TreatmentPreauthDocumentTypeComponent', () => {
  let component: TreatmentPreauthDocumentTypeComponent;
  let fixture: ComponentFixture<TreatmentPreauthDocumentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreatmentPreauthDocumentTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentPreauthDocumentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
