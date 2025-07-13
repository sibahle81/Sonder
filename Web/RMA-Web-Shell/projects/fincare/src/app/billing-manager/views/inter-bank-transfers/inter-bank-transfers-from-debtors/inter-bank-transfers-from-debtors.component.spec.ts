/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InterBankTransfersFromDebtorsComponent } from './inter-bank-transfers-from-debtors.component';

describe('InterBankTransfersFromDebtorsComponent', () => {
  let component: InterBankTransfersFromDebtorsComponent;
  let fixture: ComponentFixture<InterBankTransfersFromDebtorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterBankTransfersFromDebtorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterBankTransfersFromDebtorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
