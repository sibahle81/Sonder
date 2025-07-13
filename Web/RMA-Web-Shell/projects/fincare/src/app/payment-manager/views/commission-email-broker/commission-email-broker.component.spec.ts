import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionEmailBrokerComponent } from './commission-email-broker.component';

describe('CommissionEmailBrokerComponent', () => {
  let component: CommissionEmailBrokerComponent;
  let fixture: ComponentFixture<CommissionEmailBrokerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommissionEmailBrokerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommissionEmailBrokerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
