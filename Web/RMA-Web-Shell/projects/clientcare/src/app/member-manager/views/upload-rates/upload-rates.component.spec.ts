import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadRatesComponent } from './upload-rates.component';

describe('UploadRatesComponent', () => {
  let component: UploadRatesComponent;
  let fixture: ComponentFixture<UploadRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadRatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
