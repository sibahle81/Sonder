import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberCancelComponent } from './member-cancel.component';

describe('MemberCancelComponent', () => {
  let component: MemberCancelComponent;
  let fixture: ComponentFixture<MemberCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemberCancelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
