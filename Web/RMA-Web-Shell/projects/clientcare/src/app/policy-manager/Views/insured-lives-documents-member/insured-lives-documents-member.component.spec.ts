import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InsuredLivesDocumentsMemberComponent } from './insured-lives-documents-member.component';

describe('InsuredLivesDocumentsMemberComponent', () => {
  let component: InsuredLivesDocumentsMemberComponent;
  let fixture: ComponentFixture<InsuredLivesDocumentsMemberComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuredLivesDocumentsMemberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuredLivesDocumentsMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
