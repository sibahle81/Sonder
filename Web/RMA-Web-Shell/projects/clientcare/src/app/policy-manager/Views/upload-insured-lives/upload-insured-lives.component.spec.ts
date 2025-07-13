import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadInsuredLivesComponent } from './upload-insured-lives.component';

describe('UploadInsuredLivesComponent', () => {
  let component: UploadInsuredLivesComponent;
  let fixture: ComponentFixture<UploadInsuredLivesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadInsuredLivesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadInsuredLivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
