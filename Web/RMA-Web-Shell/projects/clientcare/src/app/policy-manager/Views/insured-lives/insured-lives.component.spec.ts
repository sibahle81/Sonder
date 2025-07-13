import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InsuredLivesComponent } from './insured-lives.component';

describe('InsuredLivesComponent', () => {
  let component: InsuredLivesComponent;
  let fixture: ComponentFixture<InsuredLivesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuredLivesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuredLivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
