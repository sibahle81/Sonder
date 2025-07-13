import { MemberWholisticViewComponent } from './views/member-wholistic-view/member-wholistic-view.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { MemberHomeComponent } from './views/member-home/member-home.component';
import { MemberLayoutComponent } from './views/member-layout/member-layout.component';
import { MemberSearchComponent } from './views/member-search/member-search.component';
import { MemberCancelComponent } from './views/member-cancel/member-cancel.component';
import { ManageIndustryClassDeclarationConfigurationComponent } from './views/renewals/manage-industry-class-declaration-configuration/manage-industry-class-declaration-configuration.component';
import { UploadRatesComponent } from './views/upload-rates/upload-rates.component';
import { MemberRenewalLetterAuditComponent } from './views/renewals/member-renewal-letter-audit/member-renewal-letter-audit.component';
import { MemberWhatsappListComponent } from './views/renewals/member-whatsapp-list/member-whatsapp-list.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';
import { BulkInvoiceReleaseComponent } from 'projects/shared-components-lib/src/lib/searches/role-player-policy-transaction-search/bulk-invoice-release/bulk-invoice-release.component';
import { CloseRenewalPeriodComponent } from 'projects/shared-components-lib/src/lib/member-declaration/close-renewal-period/close-renewal-period.component';
import { MemberCollectionReportsComponent } from './views/member-collection-reports/member-collection-reports.component';
import { MemberRenewalReportsComponent } from './views/member-renewal-reports/member-renewal-reports.component';
import { StagedMemberRatesComponent } from 'projects/shared-components-lib/src/lib/staged-member-rates/staged-member-rates/staged-member-rates.component';
import { HolisticRolePlayerViewComponent } from './views/holistic-role-player-view/holistic-role-player-view.component';
import { ReferralReportsComponent } from 'projects/shared-components-lib/src/lib/referrals/referral-reports/referral-reports.component';
import {
  CreateGroupRiskPremiumRatesComponent
} from "./views/renewals/create-group-risk-premium-rates/create-group-risk-premium-rates.component";
import {
  GroupRiskPremiumRateDetailViewComponent
} from "./views/renewals/group-risk-premium-rate-detail-view/group-risk-premium-rate-detail-view.component";

const routes: Routes = [
  {
    path: '', component: MemberLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { title: 'Member Manager', permissions: ['Member manager view'] },
    children: [
      { path: '', component: MemberHomeComponent, data: { title: 'Member Manager' } },
      { path: 'member-search', component: MemberSearchComponent, data: { title: 'Search Member' } },
      { path: 'member-search/:tabIndex', component: MemberSearchComponent, data: { title: 'Search Member' } },
      { path: 'member-wholistic-view/:id', component: MemberWholisticViewComponent, data: { title: 'Member Wholistic View' } },
      { path: 'member-wholistic-view/:id/:tabIndex', component: MemberWholisticViewComponent, data: { title: 'Member Wholistic View' } },
      { path: 'member-wholistic-view/:id/:tabIndex/:policyId', component: MemberWholisticViewComponent, data: { title: 'Member Wholistic View' } },
      { path: 'groupriskpremiumrate-details/:id/:benefitDetailId', component: GroupRiskPremiumRateDetailViewComponent, data: {  title: 'Group Risk  Premium Rates'} },
      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
      { path: 'member-cancel', component: MemberCancelComponent, data: { title: 'Cancel Member' } },
      { path: 'manage-industry-class-declaration-configuration', component: ManageIndustryClassDeclarationConfigurationComponent, data: { title: '' } },
      { path: 'upload-rates', component: UploadRatesComponent, data: { title: 'Upload Rates' } },
      { path: 'member-renewal-letter-audit', component: MemberRenewalLetterAuditComponent, data: { title: '' } },
      { path: 'member-whatsapp-list', component: MemberWhatsappListComponent, data: { title: '' } },
      { path: 'bulk-invoice-release', component: BulkInvoiceReleaseComponent, data: { title: 'Bulk Invoice Release' } },
      { path: 'close-renewal-period', component: CloseRenewalPeriodComponent, data: { title: 'Close Renewal Period' } },
      { path: 'member-collection-reports', component: MemberCollectionReportsComponent, data: { title: 'Member Collection Reports' } },
      { path: 'member-renewal-reports', component: MemberRenewalReportsComponent, data: { title: 'Member Renewal Reports' } },
      { path: 'referral-reports', component: ReferralReportsComponent, data: { title: 'Referral Reports' } },
      { path: 'staged-member-rates', component: StagedMemberRatesComponent, data: { title: 'Open Renewal Period' } },
      // { path: 'member-dashboard', component: MemberDashboardComponent, data: { title: 'Member Dashboard' } },
      { path: 'member-dashboard', component: MemberSearchComponent, data: { title: 'Search Member' } },
      { path: 'holistic-role-player-view/:id', component: HolisticRolePlayerViewComponent, data: { title: 'Role Player View' } },
      { path: 'holistic-role-player-view/:id/:tabIndex', component: HolisticRolePlayerViewComponent, data: { title: 'Role Player View' } },
      { path: 'holistic-role-player-view/:id/:tabIndex/:policyId', component: HolisticRolePlayerViewComponent, data: { title: 'Role Player View' } },
      { path: 'create-group-risk-premium-rates', component: CreateGroupRiskPremiumRatesComponent, data: { title: 'Create Group Risk Premium Rates' } },
      { path: 'groupriskpremiumrate/:type/:action/:linkedId', component: WizardHostComponent },
    ]
  }];

@NgModule({
  imports: [
    RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class MemberManagerRoutingModule { }
