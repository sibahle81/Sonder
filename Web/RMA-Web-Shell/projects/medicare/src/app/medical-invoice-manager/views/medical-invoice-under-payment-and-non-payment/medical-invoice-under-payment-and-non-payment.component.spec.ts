import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MedicalInvoiceUnderPaymentAndNonPaymentComponent } from './medical-invoice-under-payment-and-non-payment.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

describe('MedicalInvoiceUnderPaymentAndNonPaymentComponent testing', () => {
  let httpClient: HttpClient;
  let component: MedicalInvoiceUnderPaymentAndNonPaymentComponent;
  let fixture: ComponentFixture<MedicalInvoiceUnderPaymentAndNonPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [HttpClient, MedicalInvoiceUnderPaymentAndNonPaymentComponent],
      declarations: [ MedicalInvoiceUnderPaymentAndNonPaymentComponent ]
    }).compileComponents();

    // Inject the http service and test controller for each test
    httpClient = TestBed.inject(HttpClient);
    component = TestBed.inject(MedicalInvoiceUnderPaymentAndNonPaymentComponent);
    fixture = TestBed.createComponent(MedicalInvoiceUnderPaymentAndNonPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
});


