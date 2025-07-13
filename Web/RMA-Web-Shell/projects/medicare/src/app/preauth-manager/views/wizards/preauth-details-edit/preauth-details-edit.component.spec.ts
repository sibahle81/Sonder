import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreauthDetailsEditComponent } from './preauth-details-edit.component';

describe('PreauthDetailsEditComponent', () => {
  let component: PreauthDetailsEditComponent;
  let fixture: ComponentFixture<PreauthDetailsEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreauthDetailsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreauthDetailsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
