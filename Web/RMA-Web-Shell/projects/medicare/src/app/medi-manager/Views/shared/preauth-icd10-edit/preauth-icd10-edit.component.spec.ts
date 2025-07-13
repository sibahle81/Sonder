import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreauthIcd10EditComponent } from './preauth-icd10-edit.component';

describe('PreauthIcd10EditComponent', () => {
  let component: PreauthIcd10EditComponent;
  let fixture: ComponentFixture<PreauthIcd10EditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreauthIcd10EditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreauthIcd10EditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
