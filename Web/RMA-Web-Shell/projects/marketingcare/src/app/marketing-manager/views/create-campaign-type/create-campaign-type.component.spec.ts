import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCampaignTypeComponent } from './create-campaign-type.component';

describe('CreateCampaignTypeComponent', () => {
  let component: CreateCampaignTypeComponent;
  let fixture: ComponentFixture<CreateCampaignTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCampaignTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCampaignTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
