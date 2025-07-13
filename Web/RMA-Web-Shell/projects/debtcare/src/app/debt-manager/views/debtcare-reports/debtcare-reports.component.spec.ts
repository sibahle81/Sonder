import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtcareReportsComponent } from './debtcare-reports.component';

describe('DebtcareReportsComponent', () => {
  let component: DebtcareReportsComponent;
  let fixture: ComponentFixture<DebtcareReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebtcareReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtcareReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
