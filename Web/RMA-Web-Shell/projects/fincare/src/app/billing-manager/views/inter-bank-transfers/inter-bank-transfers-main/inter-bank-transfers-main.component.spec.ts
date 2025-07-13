/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InterBankTransfersMainComponent } from './inter-bank-transfers-main.component';

describe('InterBankTransfersMainComponent', () => {
  let component: InterBankTransfersMainComponent;
  let fixture: ComponentFixture<InterBankTransfersMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterBankTransfersMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterBankTransfersMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
