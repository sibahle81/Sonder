import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreauthOverviewComponent } from './preauth-overview.component';

describe('PreauthOverviewComponent', () => {
  let component: PreauthOverviewComponent;
  let fixture: ComponentFixture<PreauthOverviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreauthOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreauthOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
