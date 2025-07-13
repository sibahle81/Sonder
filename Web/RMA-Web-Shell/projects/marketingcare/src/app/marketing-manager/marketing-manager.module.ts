import { DatePipe } from "@angular/common";
import { NgModule, ComponentFactoryResolver } from "@angular/core";
import { FrameworkModule } from "src/app/framework.module";
import { SharedServicesLibModule } from "projects/shared-services-lib/src/public-api";
import { SharedModule } from "src/app/shared/shared.module";

import { MarketingCareService } from "./services/marketingcare.service";

import { MarketingHomeComponent } from "./views/marketing-home/marketing-home.component";
import { MarketingManagerRoutingModule } from "./marketing-manager-routing.module";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MarketingCareLayoutComponent } from "./views/marketing-layout/marketingcare-layout.component";
import { CampaignsComponent } from './views/campaigns/campaigns.component';
import { CreateCampaignComponent } from './views/create-campaign/create-campaign.component';
import { ScheduledCampaignComponent } from './views/scheduled-campaign/scheduled-campaign.component';
import { CreateScheduleComponent } from './views/create-schedule/create-schedule.component';
import { CreateMessageTemplateComponent } from './views/create-message-template/create-message-template.component';
import { GroupsComponent } from './views/groups/groups.component';
import { CreateGroupsComponent } from './views/create-groups/create-groups.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CampaignTypeComponent } from './views/campaign-type/campaign-type.component';
import { NgxEditorModule } from 'ngx-editor';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CreateCampaignTypeComponent } from './views/create-campaign-type/create-campaign-type.component';

import { RouterModule } from '@angular/router';
import { CommonDialogueComponent } from './views/common-dialogue/common-dialogue.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ConditionComponent } from './views/condition/condition.component';




@NgModule({
  imports: [
    FrameworkModule,
    MarketingManagerRoutingModule,
    SharedModule,
    MatTooltipModule,
    MatAutocompleteModule,
    NgxEditorModule,
    RouterModule,
    MatDialogModule,
    MatButtonModule,
    CKEditorModule,
    FormsModule
  ],
  declarations: [MarketingHomeComponent, MarketingCareLayoutComponent, CampaignsComponent, CreateCampaignComponent, ScheduledCampaignComponent, CreateScheduleComponent, CreateMessageTemplateComponent, GroupsComponent, CreateGroupsComponent, CampaignTypeComponent, CreateCampaignTypeComponent, CommonDialogueComponent, ConditionComponent],
  exports: [],

  providers: [
    SharedServicesLibModule,
    DatePipe,
    MarketingCareService,
  ],
  bootstrap: [],
})
export class MarketingManagerModule {
  constructor(componentFactoryResolver: ComponentFactoryResolver) { }
}
