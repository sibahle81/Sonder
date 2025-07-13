import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RolePlayerDialogBankingDetailsComponent } from './role-player-dialog-banking-details.component';

describe('RolePlayerDialogBankingDetailsComponent', () => {
  let component: RolePlayerDialogBankingDetailsComponent;
  let fixture: ComponentFixture<RolePlayerDialogBankingDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RolePlayerDialogBankingDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolePlayerDialogBankingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
