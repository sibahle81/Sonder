import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkItemsListComponent } from './work-items-list.component';

describe('WorkItemsListComponent', () => {
  let component: WorkItemsListComponent;
  let fixture: ComponentFixture<WorkItemsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkItemsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkItemsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
