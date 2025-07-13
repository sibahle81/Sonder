import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreauthSearchFullComponent } from './preauth-search-full.component';

describe('PreauthSearchFullComponent', () => {
  let component: PreauthSearchFullComponent;
  let fixture: ComponentFixture<PreauthSearchFullComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreauthSearchFullComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreauthSearchFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
