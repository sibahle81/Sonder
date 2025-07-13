import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TribunalLegalSecretaryComponent } from './tribunal-legal-secretary.component';

describe('TribunalLegalSecretaryComponent', () => {
  let component: TribunalLegalSecretaryComponent;
  let fixture: ComponentFixture<TribunalLegalSecretaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TribunalLegalSecretaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TribunalLegalSecretaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
