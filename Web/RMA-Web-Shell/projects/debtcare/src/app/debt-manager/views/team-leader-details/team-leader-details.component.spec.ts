import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamLeaderDetailsComponent } from './team-leader-details.component';

describe('TeamLeaderDetailsComponent', () => {
  let component: TeamLeaderDetailsComponent;
  let fixture: ComponentFixture<TeamLeaderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamLeaderDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamLeaderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
