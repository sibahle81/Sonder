/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TermArrangementAdhocPaymentInstructionsDialogComponent } from './term-arrangement-adhoc-payment-instructions-dialog.component';

describe('TermArrangementAdhocPaymentInstructionsDialogComponent', () => {
  let component: TermArrangementAdhocPaymentInstructionsDialogComponent;
  let fixture: ComponentFixture<TermArrangementAdhocPaymentInstructionsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermArrangementAdhocPaymentInstructionsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermArrangementAdhocPaymentInstructionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
