import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoveryConsultantComponent } from './recovery-consultant.component';

describe('RecoveryConsultantComponent', () => {
  let component: RecoveryConsultantComponent;
  let fixture: ComponentFixture<RecoveryConsultantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecoveryConsultantComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecoveryConsultantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
