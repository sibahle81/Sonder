import { MarketingHomeComponent } from './views/marketing-home/marketing-home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { MarketingCareLayoutComponent } from './views/marketing-layout/marketingcare-layout.component';
import { CampaignsComponent } from './views/campaigns/campaigns.component';
import { CreateCampaignComponent } from './views/create-campaign/create-campaign.component';
import { ScheduledCampaignComponent } from './views/scheduled-campaign/scheduled-campaign.component';
import { CreateScheduleComponent } from './views/create-schedule/create-schedule.component';
import { CreateMessageTemplateComponent } from './views/create-message-template/create-message-template.component';
import { GroupsComponent } from './views/groups/groups.component';
import { CreateGroupsComponent } from './views/create-groups/create-groups.component';
import { CampaignTypeComponent } from './views/campaign-type/campaign-type.component';
import { CreateCampaignTypeComponent } from './views/create-campaign-type/create-campaign-type.component';


const routes: Routes = [
  {
    path: 'campaign', component: CampaignsComponent
  },
  {
    path: 'create-campaign', component: CreateCampaignComponent
  },
  {
    path: 'scheduled-campaign', component: ScheduledCampaignComponent
  },
  {
    path: 'create-schedule', component: CreateScheduleComponent
  },
  {
    path: 'create-message-template', component: CreateMessageTemplateComponent
  },
  {
    path: 'groups', component: GroupsComponent
  },
  {
    path: 'create-groups', component: CreateGroupsComponent
  },
  {
    path: 'create-campaign-type', component: CampaignTypeComponent
  },
  {
    path: 'create-campaign-type-new', component: CreateCampaignTypeComponent
  },
  {
    path: 'marketingcare/create-campaign-type/:id',
    component: CreateCampaignTypeComponent
  },
  {
    path: 'marketingcare/edit-campaign-type/:id',
    component: CreateCampaignTypeComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class MarketingManagerRoutingModule { }
