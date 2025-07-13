import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MspGroupFilterComponent } from './msp-group-filter.component';

describe('MspGroupFilterComponent', () => {
  let component: MspGroupFilterComponent;
  let fixture: ComponentFixture<MspGroupFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MspGroupFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MspGroupFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
