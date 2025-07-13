import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TribunalLegalAdvisorComponent } from './tribunal-legal-advisor.component';

describe('TribunalLegalAdvisorComponent', () => {
  let component: TribunalLegalAdvisorComponent;
  let fixture: ComponentFixture<TribunalLegalAdvisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TribunalLegalAdvisorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TribunalLegalAdvisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
