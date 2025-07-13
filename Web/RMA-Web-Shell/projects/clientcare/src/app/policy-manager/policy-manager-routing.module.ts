import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { PolicyManagerLayoutComponent } from './views/policy-manager-layout/policy-manager-layout.component';
import { PolicyManagerHomeComponent } from './views/policy-manager-home/policy-manager-home.component';
import { CreateCaseComponent } from './views/create-case/create-case.component';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { RolePlayerViewComponent } from './views/role-player-view/role-player-view.component';
import { PersonDetailsDialogComponent } from './views/person-details-dialog/person-details-dialog.component';
import { MainMemberDetailsComponent } from './views/main-member-details/main-member-details.component';
import { ReinstatePolicyDataMigrationComponent } from './views/reinstate-policy-data-migration/reinstate-policy-data-migration.component';
import { PolicyViewGroupComponent } from './views/policy-view-group/policy-view-group.component';
import { UploadPremiumListingComponent } from './views/upload-premium-listing/upload-premium-listing.component';
import { UploadPremiumPaymentsComponent } from './views/upload-premium-payments/upload-premium-payments.component';
import { BulkLapsePoliciesComponent } from './views/bulk-lapse-policies/bulk-lapse-policies.component';
import { BulkReinstatePoliciesComponent } from './views/bulk-reinstate-policies.component/bulk-reinstate-policies.component';
import { UploadInsuredLivesComponent } from './views/upload-insured-lives/upload-insured-lives.component';
import { UploadBulkPaymentListingComponent } from './views/upload-bulk-payment-listing/upload-bulk-payment-listing.component';
import { ChildPolicyAllocationComponent } from './views/child-policy-allocation/child-policy-allocation.component';
import { PolicySearchComponent } from './views/policy-search/policy-search.component';
import { UploadedFilesComponent } from './views/child-policy-allocation/uploaded-files/uploaded-files/uploaded-files.component';
import { FileExceptionsComponent } from './views/child-policy-allocation/file-exceptions/file-exceptions/file-exceptions.component';
import { BulkCancelPoliciesComponent } from './views/bulk-cancel-policies/bulk-cancel-policies.component';
import { UploadConsolidatedFuneralComponent } from './views/upload-consolidated-funeral/upload-consolidated-funeral.component';
import { UploadMyvalueplusComponent } from './views/upload-myvalueplus/upload-myvalueplus.component';
import { UploadGroupRiskComponent } from './views/upload-group-risk/upload-group-risk.component';
import { BulkPolicySendComponent } from './views/bulk-policy-send/bulk-policy-send.component';
import { PolicyViewComponent } from './views/policy-view/policy-view.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';
import { PolicyReportsComponent } from './views/policy-reports/policy-reports.component';
import { ManualQaddComponent } from './views/manual-qadd/manual-qadd.component';
import { CreateGroupRiskPoliciesComponent } from './views/create-group-risk-policies/create-group-risk-policies.component';
import { UpdateGroupRiskPoliciesComponent } from './views/update-group-risk-policies/update-group-risk-policies.component';
import { MemberWholisticViewComponent } from '../member-manager/views/member-wholistic-view/member-wholistic-view.component';
import { HolisticRolePlayerViewComponent } from '../member-manager/views/holistic-role-player-view/holistic-role-player-view.component';
import { ReferralReportsComponent } from 'projects/shared-components-lib/src/lib/referrals/referral-reports/referral-reports.component';
import { UploadExternalPartnerPoliciesComponent } from './views/upload-external-partner-policies/upload-external-partner-policies.component';
import { SearchExternalPartnerPoliciesComponent } from './views/search-external-partner-policies/search-external-partner-policies.component';
import { GroupRiskPolicyViewComponent } from './views/group-risk-policy-view/group-risk-policy-view.component';
import { GroupRiskReportsComponent } from './views/group-risk-reports/group-risk-reports.component';


const routes: Routes = [
  {
    path: '', component: PolicyManagerLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { title: 'Policy Manager', permissions: ['Policy manager view']},
    children: [
      { path: '', component: PolicyManagerHomeComponent, data: { title: 'Policy Manager', group: 0 } },
      { path: 'dashboard', component: PolicyManagerHomeComponent, data: { title: 'Policy Manager', group: 0 } },
      { path: 'new-business', component: CreateCaseComponent, data: { title: 'New Business', group: 0 } },

      { path: 'view-policy/:id', component: PolicyViewComponent, data: { title: 'View Policy' } },
      { path: 'view-policy-group/:id', component: PolicyViewGroupComponent, data: { title: 'View Policy' } },

      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
      { path: 'new-business-individual/verify-case/:linkedId', component: WizardHostComponent },
      { path: 'upload-premium-listing', component: UploadPremiumListingComponent, data: { title: 'Premium Listing' } },
      { path: 'upload-consolidated-funeral', component: UploadConsolidatedFuneralComponent, data: { title: 'Premium Listing' } },
      { path: 'upload-myvalueplus', component: UploadMyvalueplusComponent, data: { title: 'Premium Listing' } },
      { path: 'upload-group-risk', component: UploadGroupRiskComponent, data: { title: 'Group Risk' } },
      { path: 'upload-bulk-payment-listing', component: UploadBulkPaymentListingComponent, data: { title: 'Bulk Payment Listing' } },
      { path: 'upload-premium-payments', component: UploadPremiumPaymentsComponent, data: { title: 'Premium Payments' } },
      { path: 'upload-insured-lives', component: UploadInsuredLivesComponent, data: { title: 'Insured Lives' } },
      { path: 'upload-external-partner-policies', component: UploadExternalPartnerPoliciesComponent, data: { title: 'External Partner Policies' } },
      { path: 'search-external-partner-policies', component: SearchExternalPartnerPoliciesComponent, data: { title: 'External Partner Policies' } },

      { path: 'roleplayer-details/:id', component: RolePlayerViewComponent, data: { permissions: ['View RolePlayer'] }, canActivate: [SignInGuard] },
      { path: 'person-dialog', component: PersonDetailsDialogComponent },
      { path: 'main-member', component: MainMemberDetailsComponent },

      { path: 'reinstate', component: ReinstatePolicyDataMigrationComponent, data: { title: 'Reinstate (Data Migration)' } },
      { path: 'bulk-lapse', component: BulkLapsePoliciesComponent, data: { title: 'Lapse Policies (Bulk Lapse)' } },
      { path: 'bulk-cancel', component: BulkCancelPoliciesComponent, data: { title: 'Cancel Policies (Bulk Cancel)' } },
      { path: 'bulk-reinstate', component: BulkReinstatePoliciesComponent, data: { title: 'Reinstate Policies (Bulk Reinstate)' } },
      { path: 'bulk-policy-send', component: BulkPolicySendComponent, data: { title: 'Send Policy Schedules (Bulk Transmission)' } },

      { path: 'child-policy-allocation', component: ChildPolicyAllocationComponent, data: { title: 'Child Policy Allocations' } },
      { path: 'policy-search', component: PolicySearchComponent, data: { title: 'Policy Search' } },
      { path: 'uploaded-premium-payment-files', component: UploadedFilesComponent, data: { title: 'Uploaded files' } },
      { path: 'file-exceptions/:fileId', component: FileExceptionsComponent, data: { title: 'file-exceptions' } },
      { path: 'policy-reports', component: PolicyReportsComponent, data: { title: 'Policy Reports' } },
      { path: 'referral-reports', component: ReferralReportsComponent, data: { title: 'Referral Reports' } },
      { path: 'group-risk-reports', component: GroupRiskReportsComponent, data: { title: 'Group Risk Reports' } },

      { path: 'manual-qadd', component: ManualQaddComponent, data: { title: 'Manual Qlink' } },

      { path: 'create-group-risk-policies', component: CreateGroupRiskPoliciesComponent, data: { title: 'Create Group Risk Policies' } },
      { path: 'update-group-risk-policies', component: UpdateGroupRiskPoliciesComponent, data: { title: 'Update Group Risk Policies' } },
      { path: 'view-group-risk-policies', component: UpdateGroupRiskPoliciesComponent, data: { title: 'Update Group Risk Policies' } },
      { path: 'groupriskpolicy-details/:id', component: GroupRiskPolicyViewComponent, data: {  title: 'Maintain Group Risk Policies'} },
      { path: 'maintain-groupriskpolicy/:type/:action/:linkedId', component: WizardHostComponent },

      { path: 'member-wholistic-view/:id', component: MemberWholisticViewComponent, data: { title: 'Member Wholistic View' } },
      { path: 'member-wholistic-view/:id/:tabIndex', component: MemberWholisticViewComponent, data: { title: 'Member Wholistic View' } },
      { path: 'member-wholistic-view/:id/:tabIndex/:policyId', component: MemberWholisticViewComponent, data: { title: 'Member Wholistic View' } },

      { path: 'holistic-role-player-view/:id', component: HolisticRolePlayerViewComponent, data: { title: 'Role Player View' } },
      { path: 'holistic-role-player-view/:id/:tabIndex', component: HolisticRolePlayerViewComponent, data: { title: 'Role Player View' } },
      { path: 'holistic-role-player-view/:id/:tabIndex/:policyId', component: HolisticRolePlayerViewComponent, data: { title: 'Role Player View' } },
      { path: 'child-policy-allocation/:id', component: ChildPolicyAllocationComponent, data: { title: 'Child Policy Allocations' } },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PolicyManagerRoutingModule { }
