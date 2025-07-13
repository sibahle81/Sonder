import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreauthHcpViewComponent } from './preauth-hcp-view.component';

describe('PreauthHcpViewComponent', () => {
  let component: PreauthHcpViewComponent;
  let fixture: ComponentFixture<PreauthHcpViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreauthHcpViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreauthHcpViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
