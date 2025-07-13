import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessWriteOffComponent } from './process-write-off.component';

describe('ProcessWriteOffComponent', () => {
  let component: ProcessWriteOffComponent;
  let fixture: ComponentFixture<ProcessWriteOffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessWriteOffComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessWriteOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
