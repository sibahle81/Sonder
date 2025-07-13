import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkItemSearchComponent } from './work-item-search.component';

describe('WorkItemSearchComponent', () => {
  let component: WorkItemSearchComponent;
  let fixture: ComponentFixture<WorkItemSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkItemSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkItemSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
