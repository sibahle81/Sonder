import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProstheticQuotationTypeComponent } from './prosthetic-quotation-type.component';

describe('ProstheticQuotationTypeComponent', () => {
  let component: ProstheticQuotationTypeComponent;
  let fixture: ComponentFixture<ProstheticQuotationTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProstheticQuotationTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProstheticQuotationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
