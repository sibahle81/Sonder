import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UndertakerComponent } from './undertaker.component';

describe('UndertakerComponent', () => {
  let component: UndertakerComponent;
  let fixture: ComponentFixture<UndertakerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UndertakerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndertakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});