import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOverviewComponent } from './work-overview.component';

describe('WorkOverviewComponent', () => {
  let component: WorkOverviewComponent;
  let fixture: ComponentFixture<WorkOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
