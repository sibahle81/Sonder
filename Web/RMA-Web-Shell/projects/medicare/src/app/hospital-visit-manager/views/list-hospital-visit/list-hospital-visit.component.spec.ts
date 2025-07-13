import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ListHospitalVisitComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/list-hospital-visit/list-hospital-visit.component';

describe('ListHospitalVisitComponent', () => {
  let component: ListHospitalVisitComponent;
  let fixture: ComponentFixture<ListHospitalVisitComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListHospitalVisitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListHospitalVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
