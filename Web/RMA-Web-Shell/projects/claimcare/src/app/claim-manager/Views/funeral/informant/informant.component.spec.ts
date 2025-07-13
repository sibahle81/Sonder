import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InformantComponent } from './informant.component';

describe('InformantComponent', () => {
  let component: InformantComponent;
  let fixture: ComponentFixture<InformantComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InformantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});