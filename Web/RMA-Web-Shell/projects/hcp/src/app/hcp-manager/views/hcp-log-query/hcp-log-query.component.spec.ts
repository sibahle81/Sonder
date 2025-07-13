import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HcpLogQueryComponent } from './hcp-log-query.component';

describe('HcpLogQueryComponent', () => {
  let component: HcpLogQueryComponent;
  let fixture: ComponentFixture<HcpLogQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HcpLogQueryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HcpLogQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
