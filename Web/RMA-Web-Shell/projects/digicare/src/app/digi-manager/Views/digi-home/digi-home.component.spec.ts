import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DigiHomeComponent } from './digi-home.component';

describe('DigiHomeComponent', () => {
  let component: DigiHomeComponent;
  let fixture: ComponentFixture<DigiHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DigiHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DigiHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
