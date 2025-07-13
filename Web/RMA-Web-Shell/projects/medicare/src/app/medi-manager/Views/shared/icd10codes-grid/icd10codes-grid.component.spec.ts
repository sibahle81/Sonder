import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { Icd10codesGridComponent } from './icd10codes-grid.component';

describe('Icd10codesGridComponent', () => {
  let component: Icd10codesGridComponent;
  let fixture: ComponentFixture<Icd10codesGridComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ Icd10codesGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Icd10codesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
