import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PreauthListComponent } from './preauth-list-component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

describe('PreauthListComponent testing', () => {
  let httpClient: HttpClient;
  let component: PreauthListComponent;
  let fixture: ComponentFixture<PreauthListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [HttpClient, PreauthListComponent],
      declarations: [ PreauthListComponent ]
    }).compileComponents();

    // Inject the http service and test controller for each test
    httpClient = TestBed.inject(HttpClient);
    component = TestBed.inject(PreauthListComponent);
    fixture = TestBed.createComponent(PreauthListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });





  
});


