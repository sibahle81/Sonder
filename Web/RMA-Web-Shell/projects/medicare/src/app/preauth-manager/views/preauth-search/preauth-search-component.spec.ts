import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreauthSearchComponent } from './preauth-search-component';

describe('PreauthSearchComponent', () => {
  let component: PreauthSearchComponent;
  let fixture: ComponentFixture<PreauthSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreauthSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreauthSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
