import { ClientDashboardRoutingModule } from './client-dashboard-routing.module';
import { FrameworkModule } from 'src/app/framework.module';
import { NgModule } from '@angular/core';
import { DashboardService } from './services/dashboard.service';
import { ClientCareDashboardComponent } from './views/client-care-dashboard/client-care-dashboard.component';
import { ChartsModule } from 'ng2-charts';
import { PolicyService } from '../policy-manager/shared/Services/policy.service';
import { PoliciesPerStatusWidgetComponent } from './views/policies-per-status-widget/policies-per-status-widget.component';
import { PolicyDetailsWidgetComponent } from './views/policy-details-widget/policy-details-widget.component';
import { PolicyDocumentsWidgetComponent } from './views/policy-documents-widget/policy-documents-widget.component';
import { InsuredLifeService } from '../policy-manager/shared/Services/insured-life.service';
import { RolePlayerService } from '../policy-manager/shared/Services/roleplayer.service';
import { BrokerageService } from '../broker-manager/services/brokerage.service';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { ClientCareSharedModule } from '../shared/clientcare.shared.module';
import { QuoteStatusOverviewDashboardWidgetComponent } from './views/quote-status-overview-dashboard-widget/quote-status-overview-dashboard-widget.component';
import { QuoteAgeAnalysisOverviewDashboardWidgetComponent } from './views/quote-age-analysis-overview-dashboard-widget/quote-age-analysis-overview-dashboard-widget.component';
import { LeadStatusOverviewWidgetComponent } from './views/lead-status-overview-widget/lead-status-overview-widget.component';
import { LeadAgeAnalysisOverviewWidgetComponent } from './views/lead-age-analysis-overview-widget/lead-age-analysis-overview-widget.component';
import { ActiveMembersDashboardWidgetComponent } from './views/active-members-dashboard-widget/active-members-dashboard-widget.component';
import { ActiveNumberMembersClassXIIIDashboardWidgetComponent } from './views/active-number-members-class-xiii-dashboard-widget/active-number-members-class-xiii-dashboard-widget.component';
import { AmountInvoicedClassXIIIDashboardWidgetComponent } from './views/amount-invoiced-class-xiii-dashboard-widget/amount-invoiced-class-xiii-dashboard-widget.component';
import { AmountInvoicedDashboardWidgetComponent } from './views/amount-invoiced-dashboard-widget/amount-invoiced-dashboard-widget.component';
import { AmountPaidClassIVDashboardWidgetComponent } from './views/amount-paid-class-IV-dashboard-widget/amount-paid-class-IV-dashboard-widget.component';
import { AmountPaidClassXIIIDashboardWidgetComponent } from './views/amount-paid-class-XIII-dashboard-widget/amount-paid-class-XIII-dashboard-widget.component';
import { CancellationsClassXIIIDashboardWidgetComponent } from './views/cancellations-class-XIII-dashboard-widget/cancellations-class-XIII-dashboard-widget.component';;
import { MembersPerIndustryClassXIIIDashboardWidgetComponent } from './views/members-per-industry-class-XIII-dashboard-widget/members-per-industry-class-XIII-dashboard-widget.component';
import { NewBusinessCoidPoliciesClassIVDashboardWidgetComponent } from './views/new-business-coid-policies-class-IV-dashboard-widget/new-business-coid-policies-class-IV-dashboard-widget.component';
import { NewBusinessCoidPoliciesClassXIIIDashboardWidgetComponent } from './views/new-business-coid-policies-class-XIII-dashboard-widget/new-business-coid-policies-class-XIII-dashboard-widget.component';
import { NonCoidMetalMembersPerMonthDashboardWidgetComponent } from './views/non-coid-metal-members-per-month-dashboard-widget/non-coid-metal-members-per-month-dashboard-widget.component';
import { NonCoidMetalMembersPerProductDashboardWidgetComponent } from './views/non-coid-metal-members-per-product-dashboard-widget/non-coid-metal-members-per-product-dashboard-widget.component';
import { NonCoidMiningMembersPerMonthDashboardWidgetComponent } from './views/non-coid-mining-members-per-month-dashboard-widget/non-coid-mining-members-per-month-dashboard-widget.component';
import { NonCoidMiningMembersPerProductDashboardWidgetComponent } from './views/non-coid-mining-members-per-product-dashboard-widget/non-coid-mining-members-per-product-dashboard-widget.component';
import { NumberOfLivesClassIVDashboardWidgetComponent } from './views/number-of-lives-class-IV-dashboard-widget/number-of-lives-class-IV-dashboard-widget.component';
import { NumberOfLivesClassXIIIDashboardWidgetComponent } from './views/number-of-lives-class-XIII-dashboard-widget/number-of-lives-class-XIII-dashboard-widget.component';

@NgModule({
  imports: [
    ClientCareSharedModule,
    FrameworkModule,
    ClientDashboardRoutingModule,
    ChartsModule,
    WizardModule
  ],
  declarations: [
    ClientCareDashboardComponent,
    PoliciesPerStatusWidgetComponent,
    PolicyDetailsWidgetComponent,
    PolicyDocumentsWidgetComponent,
    QuoteStatusOverviewDashboardWidgetComponent,
    QuoteAgeAnalysisOverviewDashboardWidgetComponent ,
    LeadStatusOverviewWidgetComponent ,
    LeadAgeAnalysisOverviewWidgetComponent,
    ActiveMembersDashboardWidgetComponent,
    ActiveNumberMembersClassXIIIDashboardWidgetComponent,
    AmountInvoicedClassXIIIDashboardWidgetComponent,
    AmountInvoicedDashboardWidgetComponent,
    AmountPaidClassIVDashboardWidgetComponent,
    AmountPaidClassXIIIDashboardWidgetComponent,
    CancellationsClassXIIIDashboardWidgetComponent,
    MembersPerIndustryClassXIIIDashboardWidgetComponent,
    NewBusinessCoidPoliciesClassIVDashboardWidgetComponent,
    NewBusinessCoidPoliciesClassXIIIDashboardWidgetComponent,
    NonCoidMetalMembersPerMonthDashboardWidgetComponent,
    NonCoidMetalMembersPerProductDashboardWidgetComponent,
    NonCoidMiningMembersPerMonthDashboardWidgetComponent,
    NonCoidMiningMembersPerProductDashboardWidgetComponent,
    NumberOfLivesClassIVDashboardWidgetComponent,
    NumberOfLivesClassXIIIDashboardWidgetComponent],
  exports: [
    ClientCareDashboardComponent,
    PolicyDetailsWidgetComponent
  ],
  providers: [
    DashboardService,
    PolicyService,
    InsuredLifeService,
    RolePlayerService,
    BrokerageService
  ]
})

export class ClientDashboardModule {
  constructor() {
  }
}
