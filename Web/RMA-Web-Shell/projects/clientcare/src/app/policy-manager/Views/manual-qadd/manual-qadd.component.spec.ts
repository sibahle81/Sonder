import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualQaddComponent } from './manual-qadd.component';

describe('ManualQaddComponent', () => {
  let component: ManualQaddComponent;
  let fixture: ComponentFixture<ManualQaddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualQaddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualQaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
