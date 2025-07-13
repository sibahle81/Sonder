import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsTeamLeaderComponent } from './collections-team-leader.component';

describe('CollectionsTeamLeaderComponent', () => {
  let component: CollectionsTeamLeaderComponent;
  let fixture: ComponentFixture<CollectionsTeamLeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionsTeamLeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionsTeamLeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
