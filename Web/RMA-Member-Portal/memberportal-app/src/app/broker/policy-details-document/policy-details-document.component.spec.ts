import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyDetailsDocumentComponent } from './policy-details-document.component';

describe('PolicyDetailsDocumentComponent', () => {
  let component: PolicyDetailsDocumentComponent;
  let fixture: ComponentFixture<PolicyDetailsDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyDetailsDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyDetailsDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
