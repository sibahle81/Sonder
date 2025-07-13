import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceUnderAssessReasonsViewerModalComponent } from './invoice-under-assess-reasons-viewer-modal.component';

describe('InvoiceUnderAssessReasonsViewerModalComponent', () => {
  let component: InvoiceUnderAssessReasonsViewerModalComponent;
  let fixture: ComponentFixture<InvoiceUnderAssessReasonsViewerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceUnderAssessReasonsViewerModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceUnderAssessReasonsViewerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
