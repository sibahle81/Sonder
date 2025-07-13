import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BodyCollectionComponent } from './body-collection.component';

describe('BodyCollectionComponent', () => {
  let component: BodyCollectionComponent;
  let fixture: ComponentFixture<BodyCollectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BodyCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BodyCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});