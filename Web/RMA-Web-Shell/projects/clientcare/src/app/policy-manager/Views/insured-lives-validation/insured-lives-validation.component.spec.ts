import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InsuredLivesValidationComponent } from './insured-lives-validation.component';

describe('InsuredLivesValidationComponent', () => {
  let component: InsuredLivesValidationComponent;
  let fixture: ComponentFixture<InsuredLivesValidationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuredLivesValidationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuredLivesValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
