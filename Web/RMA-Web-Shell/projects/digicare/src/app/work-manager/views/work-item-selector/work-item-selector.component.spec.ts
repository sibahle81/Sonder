import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkItemSelectorComponent } from './work-item-selector.component';

describe('WorkItemSelectorComponent', () => {
  let component: WorkItemSelectorComponent;
  let fixture: ComponentFixture<WorkItemSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkItemSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkItemSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
