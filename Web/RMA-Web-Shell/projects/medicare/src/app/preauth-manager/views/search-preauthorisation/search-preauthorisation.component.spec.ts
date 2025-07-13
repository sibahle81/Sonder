import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SearchPreauthorisationComponent } from './search-preauthorisation.component';

describe('SearchPreauthorisationComponent', () => {
  let component: SearchPreauthorisationComponent;
  let fixture: ComponentFixture<SearchPreauthorisationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchPreauthorisationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPreauthorisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
