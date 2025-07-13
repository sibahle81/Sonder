import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitReasonDialogComponent } from './exit-reason-dialog.component';

describe('ExitReasonDialogComponent', () => {
  let component: ExitReasonDialogComponent;
  let fixture: ComponentFixture<ExitReasonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExitReasonDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExitReasonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
