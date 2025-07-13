import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreauthClaimViewComponent } from './preauth-claim-view.component';

describe('PreauthClaimViewComponent', () => {
  let component: PreauthClaimViewComponent;
  let fixture: ComponentFixture<PreauthClaimViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreauthClaimViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreauthClaimViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
