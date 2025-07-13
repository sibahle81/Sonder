import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionSummaryComponent } from './commission-summary.component';

describe('CommissionSummaryComponent', () => {
  let component: CommissionSummaryComponent;
  let fixture: ComponentFixture<CommissionSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommissionSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
