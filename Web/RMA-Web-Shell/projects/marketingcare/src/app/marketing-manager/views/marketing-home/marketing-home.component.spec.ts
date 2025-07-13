import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingHomeComponent } from './marketing-home.component';

describe('MarketingHomeComponent', () => {
  let component: MarketingHomeComponent;
  let fixture: ComponentFixture<MarketingHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
