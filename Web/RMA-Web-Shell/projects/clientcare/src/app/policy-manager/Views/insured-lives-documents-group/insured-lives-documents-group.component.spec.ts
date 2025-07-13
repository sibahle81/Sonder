import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InsuredLivesDocumentsGroupComponent } from './insured-lives-documents-group.component';

describe('InsuredLivesDocumentsGroupComponent', () => {
  let component: InsuredLivesDocumentsGroupComponent;
  let fixture: ComponentFixture<InsuredLivesDocumentsGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuredLivesDocumentsGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuredLivesDocumentsGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
