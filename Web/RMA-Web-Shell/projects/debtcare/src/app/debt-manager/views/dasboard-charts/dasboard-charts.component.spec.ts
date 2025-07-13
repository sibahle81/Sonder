import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DasboardChartsComponent } from './dasboard-charts.component';

describe('DasboardChartsComponent', () => {
  let component: DasboardChartsComponent;
  let fixture: ComponentFixture<DasboardChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DasboardChartsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DasboardChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
