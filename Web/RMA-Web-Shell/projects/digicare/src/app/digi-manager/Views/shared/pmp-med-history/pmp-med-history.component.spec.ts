import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmpMedHistoryComponent } from './pmp-med-history.component';

describe('PmpMedHistoryComponent', () => {
  let component: PmpMedHistoryComponent;
  let fixture: ComponentFixture<PmpMedHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PmpMedHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PmpMedHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
