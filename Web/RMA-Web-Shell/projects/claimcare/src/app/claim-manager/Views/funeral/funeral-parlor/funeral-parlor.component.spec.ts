import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FuneralParlorComponent } from './funeral-parlor.component';

describe('FuneralParlorComponent', () => {
  let component: FuneralParlorComponent;
  let fixture: ComponentFixture<FuneralParlorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FuneralParlorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuneralParlorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});