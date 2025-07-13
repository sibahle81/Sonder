import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MediHomeComponent } from './medi-home.component';

describe('MediHomeComponent', () => {
  let component: MediHomeComponent;
  let fixture: ComponentFixture<MediHomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MediHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
