import { NgModule } from '@angular/core';
import { CampaignLastViewedListComponent } from './views/campaign-last-viewed/campaign-last-viewed.component';
import { CampaignDetailsComponent } from './views/campaign-details/campaign-details.component';
import { CampaignFindComponent } from './views/campaign-find/campaign-find.component';
import { CampaignListComponent } from './views/campaign-list/campaign-list.component';
import { CampaignTemplateComponent } from './views/campaign-template/campaign-template.component';
import { CampaignReminderComponent } from './views/campaign-reminder/campaign-reminder.component';
import { TargetAudienceListComponent } from './views/target-audience-list/target-audience-list.component';
import { TargetAudienceService } from './shared/services/target-audience.service';
import { TargetAudienceDataSource } from './views/target-audience-list/target-audience-list.datasource';
import { TargetAudienceLeadComponent } from './views/target-audience-leads/target-audience-leads.component';
import { TargetAudienceClientComponent } from './views/target-audience-clients/target-audience-clients.component';
import { RetentionsReportComponent } from './views/report-retentions/report-retentions.component';
import { RetentionReportDataSource } from './views/report-retentions/report-retentions.datasource';
import { CampaignListDataSource } from './views/campaign-list/campaign-list.datasource';
import { CampaignReviewDataSource } from './views/campaign-review/campaign-review.datasource';
import { CampaignLastViewedDataSource } from './views/campaign-last-viewed/campaign-last-viewed.datasource';
import { AudienceTypePipe } from './views/pipe/audience-type.pipe';
import { SearchModule } from 'projects/clientcare/src/app/shared/search/search.module';
import { TemplateService } from './shared/services/template-service';
import { TemplateLastViewedListComponent } from './views/template-last-viewed/template-last-viewed.component';
import { TemplateDetailsComponent } from './views/template-details/template-details.component';
import { TemplateFindComponent } from './views/template-find/template-find.component';
import { TemplateLastViewedDataSource } from './views/template-last-viewed/template-last-viewed.datasource';
import { CampaignMembersDataSource } from './views/campaign-members/campaign-members.datasource';
import { CampaignMembersComponent} from './views/campaign-members/campaign-members.component';

import { CampaignReportService } from './views/report-shared/reports.service';
import { CampaignService } from './shared/services/campaign-service';
import { ApprovalService } from 'projects/clientcare/src/app/shared/approvals/approval.service';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { ClientService } from 'projects/clientcare/src/app/client-manager/shared/services/client.service';
import { ApprovalTypeService } from 'projects/clientcare/src/app/shared/approvals/approvaltype.service';
import { TargetAudienceMemberService } from './shared/services/target-audience-member.service';
import { CampaignReminderService } from './shared/services/campaign-reminder.service';
import { CampaignEmailService} from './shared/services/campaign-email.service';
import { CampaignSmsService} from './shared/services/campaign-sms.service';
import { FrameworkModule } from 'src/app/framework.module';
import { CampaignManagerHomeComponent } from './views/campaign-manager-home/campaign-manager-home.component';
import { CampaignManagerLayoutComponent } from './views/campaign-manager-layout/campaign-manager-layout.component';
import { CampaignReviewComponent } from './views/campaign-review/campaign-review.component';
import { CampaignManagerRoutingModule } from './campaign-manager-routing.module';
import { CampaignManagerBreadcrumbService } from './shared/services/campaign-manager-breadcrumb.service';
import { CampaignSearchComponent } from './views/campaign-search/campaign-search.component';

@NgModule({
    imports: [
        SearchModule,
        FrameworkModule,
        CampaignManagerRoutingModule,
    ],
    declarations: [
        AudienceTypePipe,
        CampaignDetailsComponent,
        CampaignFindComponent,
        CampaignLastViewedListComponent,
        CampaignListComponent,
        CampaignManagerHomeComponent,
        CampaignManagerLayoutComponent,
        CampaignMembersComponent,
        CampaignReminderComponent,
        CampaignReviewComponent,
        CampaignTemplateComponent,
        RetentionsReportComponent,
        TargetAudienceClientComponent,
        TargetAudienceLeadComponent,
        TargetAudienceListComponent,
        TemplateDetailsComponent,
        TemplateFindComponent,
        TemplateLastViewedListComponent,
        CampaignSearchComponent
    ],
    exports: [
    ],
    providers: [
        ApprovalService,
        ApprovalTypeService,
        CampaignEmailService,
        CampaignLastViewedDataSource,
        CampaignListDataSource,
        CampaignManagerBreadcrumbService,
        CampaignMembersDataSource,
        CampaignReminderService,
        CampaignReportService,
        CampaignReviewDataSource,
        CampaignService,
        CampaignSmsService,
        ClientService,
        ProductService,
        RetentionReportDataSource,
        TargetAudienceDataSource,
        TargetAudienceMemberService,
        TargetAudienceService,
        TemplateLastViewedDataSource,
        TemplateService,
        UserService
    ]
})
export class CampaignManagerModule { }
