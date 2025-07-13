import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDailogComponent } from './common-dailog.component';

describe('CommonDailogComponent', () => {
  let component: CommonDailogComponent;
  let fixture: ComponentFixture<CommonDailogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonDailogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
