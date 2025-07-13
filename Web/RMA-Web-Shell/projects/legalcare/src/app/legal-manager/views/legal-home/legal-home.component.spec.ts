import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalHomeComponent } from './legal-home.component';

describe('LegalHomeComponent', () => {
  let component: LegalHomeComponent;
  let fixture: ComponentFixture<LegalHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LegalHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
