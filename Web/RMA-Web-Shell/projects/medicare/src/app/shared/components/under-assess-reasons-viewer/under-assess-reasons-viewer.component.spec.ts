import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderAssessReasonsViewerComponent } from './under-assess-reasons-viewer.component';

describe('UnderAssessReasonsViewerComponent', () => {
  let component: UnderAssessReasonsViewerComponent;
  let fixture: ComponentFixture<UnderAssessReasonsViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnderAssessReasonsViewerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnderAssessReasonsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
