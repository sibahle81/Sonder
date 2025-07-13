import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ForensicPathologistComponent } from './forensic-pathologist.component';

describe('ForensicPathologistComponent', () => {
  let component: ForensicPathologistComponent;
  let fixture: ComponentFixture<ForensicPathologistComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ForensicPathologistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForensicPathologistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});