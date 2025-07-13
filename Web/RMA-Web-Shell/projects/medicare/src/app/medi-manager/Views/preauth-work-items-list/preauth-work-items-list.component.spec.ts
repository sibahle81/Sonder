import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreauthWorkItemsListComponent } from 'projects/medicare/src/app/medi-manager/views/preauth-work-items-list/preauth-work-items-list.component';

describe('PreauthWorkItemsListComponent', () => {
  let component: PreauthWorkItemsListComponent;
  let fixture: ComponentFixture<PreauthWorkItemsListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreauthWorkItemsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreauthWorkItemsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
