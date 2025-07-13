import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoveryLegalHeadComponent } from './recovery-legal-head.component';

describe('RecoveryLegalHeadComponent', () => {
  let component: RecoveryLegalHeadComponent;
  let fixture: ComponentFixture<RecoveryLegalHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecoveryLegalHeadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecoveryLegalHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
