import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreauthWorkItemSearchComponent } from 'projects/medicare/src/app/medi-manager/views/preauth-work-item-search/preauth-work-item-search.component';

describe('PreauthWorkItemSearchComponent', () => {
  let component: PreauthWorkItemSearchComponent;
  let fixture: ComponentFixture<PreauthWorkItemSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreauthWorkItemSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreauthWorkItemSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
