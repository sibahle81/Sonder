import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { InterBankTransferService } from 'projects/fincare/src/app/billing-manager/services/interbanktransfer.service';
import { RolePlayerAddressDetailDataSource } from 'projects/shared-components-lib/src/lib/role-player-address-detail/role-player-address-detail.datasource';
import { RolePlayerBankingDetailDataSource } from 'projects/shared-components-lib/src/lib/role-player-banking-detail/role-player-banking-detail.datasource';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { LoginService } from 'projects/shared-services-lib/src/lib/services/security/login/login.service';
import { FrameworkModule } from 'src/app/framework.module';
import { BrokerageService } from '../broker-manager/services/brokerage.service';
import { RepresentativeService } from '../broker-manager/services/representative.service';
import { BreadcrumbClientService } from '../client-manager/shared/services/breadcrumb-client.service';
import { MemberManagerModule } from '../member-manager/member-manager.module';
import { DeclarationService } from '../member-manager/services/declaration.service';
import { BenefitService } from '../product-manager/services/benefit.service';
import { ProductOptionService } from '../product-manager/services/product-option.service';
import { ClientCareSharedModule } from '../shared/clientcare.shared.module';
import { SearchModule } from '../shared/search/search.module';
import { BulkCancelPoliciesComponent } from './views/bulk-cancel-policies/bulk-cancel-policies.component';
import { BulkLapsePoliciesComponent } from './views/bulk-lapse-policies/bulk-lapse-policies.component';
import { BulkPolicySendComponent } from './views/bulk-policy-send/bulk-policy-send.component';
import { BulkPolicySendService } from './views/bulk-policy-send/bulk-policy-send.service';
import { BulkReinstatePoliciesComponent } from './views/bulk-reinstate-policies.component/bulk-reinstate-policies.component';
import { ChildPolicyAllocationComponent } from './views/child-policy-allocation/child-policy-allocation.component';
import { FileExceptionsComponent } from './views/child-policy-allocation/file-exceptions/file-exceptions/file-exceptions.component';
import { UploadedFilesComponent } from './views/child-policy-allocation/uploaded-files/uploaded-files/uploaded-files.component';
import { PolicyChildDataSource } from './views/child-policy-selection/child-policy-selection.datasource';
import { GroupPolicyMemberCancellationDatasource } from './views/group-policy-member-cancellation/group-policy-member-cancellation.datasource';
import { GroupPolicySchemeService } from './views/group-policy-scheme-selection/group-policy-scheme.service';
import { PolicyAmendmentsDatasource } from './views/policy-amendments/policy-amendments.datasource';
import { UploadConsolidatedFuneralComponent } from './views/upload-consolidated-funeral/upload-consolidated-funeral.component';
import { UploadGroupRiskComponent } from './views/upload-group-risk/upload-group-risk.component';
import { PremiumListingMemberDatasource } from './datasources/premium-listing-member.datasource';
import { RolePlayerDataSource } from './datasources/roleplayer.datasource';
import { PolicyManagerRoutingModule } from './policy-manager-routing.module';
import { BreadcrumbPolicyService } from './services/breadcrumb-policy.service';
import { CaseService } from './shared/Services/case.service';
import { FuneralPolicyPremiumService } from './shared/Services/funeral-policy-premium.service';
import { PolicyProcessService } from './shared/Services/policy-process.service';
import { PolicyService } from './shared/Services/policy.service';
import { PremiumListingService } from './shared/Services/premium-listing.service';
import { RolePlayerService } from './shared/Services/roleplayer.service';
import { PolicySchedulePreviewComponent } from './shared/views/policy-schedule-preview-component/policy-schedule-preview.component';
import { AddressWizardComponent } from './views/address-wizard/address-wizard.component';
import { BeneficiaryListComponent } from './views/beneficiary-list/beneficiary-list.component';
import { CancelPolicyReasonDialogComponent } from './views/cancel-policy-reason-dialog/cancel-policy-reason-dialog.component';
import { CasePolicyOptionsComponent } from './views/case-policy-options/case-policy-options.component';
import { ChildPolicySelectionComponent } from './views/child-policy-selection/child-policy-selection.component';
import { ConsolidatedFuneralMembersComponent } from './views/consolidated-funeral-members/consolidated-funeral-members.component';
import { GroupRiskMembersComponent } from './views/group-risk-members/group-risk-members.component';
import { ConsolidatedFuneralSummaryComponent } from './views/consolidated-funeral-summary/consolidated-funeral-summary.component';
import { GroupRiskSummaryComponent } from './views/group-risk-summary/group-risk-summary.component';
import { ContinueOutstandingPremiumsComponent } from './views/continue-outstanding-premiums/continue-outstanding-premiums.component';
import { ContinuePolicyDialogComponent } from './views/continue-policy-dialog/continue-policy-dialog.component';
import { CreateCaseDocumentsComponent } from './views/create-case-documents/create-case-documents.component';
import { CreateCaseComponent } from './views/create-case/create-case.component';
import { ExtendedFamilyListComponent } from './views/extended-family-list/extended-family-list.component';
import { GroupMemberDetailsComponent } from './views/group-members-details/group-member-details.component';
import { GroupPolicyBenefitsComponent } from './views/group-policy-benefits/group-policy-benefits.component';
import { GroupPolicyBenefitsDataSource } from './views/group-policy-benefits/group-policy-benefits.datasource';
import { GroupPolicyCompanyComponent } from './views/group-policy-company/group-policy-company.component';
import { GroupPolicyMainMemberComponent } from './views/group-policy-main-member/group-policy-main-member.component';
import { GroupPolicyMemberCancellationComponent } from './views/group-policy-member-cancellation/group-policy-member-cancellation..component';
import { GroupPolicyMembersComponent } from './views/group-policy-members/group-policy-members.component';
import { GroupPolicyMembersDatasource } from './views/group-policy-members/group-policy-members.datasource';
import { GroupPolicySchemeSourceComponent } from './views/group-policy-scheme-source/group-policy-scheme-source.component';
import { GroupPolicySchemeTargetComponent } from './views/group-policy-scheme-target/group-policy-scheme-target.component';
import { GroupSchemeBenefitsComponent } from './views/group-scheme-benefits/group-scheme-benefits.component';
import { GroupSchemeChildPoliciesComponent } from './views/group-scheme-child-policies/group-scheme-child-policies.component';
import { GroupSchemeProductOptionComponent } from './views/group-scheme-product-option/group-scheme-product-option.component';
import { InsuredLivesDocumentsGroupComponent } from './views/insured-lives-documents-group/insured-lives-documents-group.component';
import { InsuredLivesDocumentsMemberComponent } from './views/insured-lives-documents-member/insured-lives-documents-member.component';
import { InsuredLivesValidationComponent } from './views/insured-lives-validation/insured-lives-validation.component';
import { InsuredLivesComponent } from './views/insured-lives/insured-lives.component';
import { LapsePolicyViewComponent } from './views/lapse-policy-view/lapse-policy-view.component';
import { MainMemberCancellationComponent } from './views/main-member-cancellation/main-member-cancellation.component';
import { MainMemberContinuePolicyComponent } from './views/main-member-continue-policy/main-member-continue-policy.component';
import { MainMemberDetailsComponent } from './views/main-member-details/main-member-details.component';
import { MainMemberPersonComponent } from './views/main-member-person/main-member-person.component';
import { MainMemberPolicyListComponent } from './views/main-member-policy-list/main-member-policy-list.component';
import { MemberContinuePolicyComponent } from './views/member-continue-policy/member-continue-policy.component';
import { MovePolicyComponent } from './views/move-policy/move-policy.component';
import { MoveBrokerPolicyDataSource } from './views/move-policy/move-policy.datasource';
import { PersonDetailsDialogComponent } from './views/person-details-dialog/person-details-dialog.component';
import { PersonDetailsComponent } from './views/person-details/person-details.component';
import { PolicyAddressDetailsComponent } from './views/policy-address-details/policy-address-details.component';
import { PolicyAmendmentsComponent } from './views/policy-amendments/policy-amendments.component';
import { PolicyBankingDetailsComponent } from './views/policy-banking-details/policy-banking-details.component';
import { PolicyBenefitsComponent } from './views/policy-benefits/policy-benefits.component';
import { PolicyBenefitsDataSource } from './views/policy-benefits/policy-benefits.datasource';
import { PolicyCancellationDataSource } from './views/policy-cancellation/policy-cancellation-datasource';
import { PolicyCancellationComponent } from './views/policy-cancellation/policy-cancellation.component';
import { PolicyCollectionDetailsComponent } from './views/policy-collection-details/policy-collection-details.component';
import { PolicyContactDetailsComponent } from './views/policy-contact-details/policy-contact-details.component';
import { PolicyInfoMainMemberComponent } from './views/policy-info-main-member/policy-info-main-member.component';
import { PolicyInformationComponent } from './views/policy-information/policy-information.component';
import { PolicyLastViewedListComponent } from './views/policy-last-viewed-list/policy-last-viewed-list.component';
import { PolicyLastViewedListDataSource } from './views/policy-last-viewed-list/policy-last-viewed-list.datasource';
import { PolicyListDialogComponent } from './views/policy-list-dialog/policy-list-dialog.component';
import { PolicyManagerHomeComponent } from './views/policy-manager-home/policy-manager-home.component';
import { PolicyManagerLayoutComponent } from './views/policy-manager-layout/policy-manager-layout.component';
import { PolicyMemberDocumentsDataSource } from './views/policy-member-documents/policy-member-documents-datasource';
import { PolicyMemberDocumentsComponent } from './views/policy-member-documents/policy-member-documents.component';
import { PolicyNotesComponent } from './views/policy-notes/policy-notes.component';
import { PolicyProductOptionsComponent } from './views/policy-product-options/policy-product-options.component';
import { PolicyScheduleDataSource } from './views/policy-schedule/policy-schedule-datasource';
import { PolicyScheduleComponent } from './views/policy-schedule/policy-schedule.component';
import { PolicySearchComponent } from './views/policy-search/policy-search.component';
import { PolicyStatusSummaryComponent } from './views/policy-status-summary/policy-status-summary.component';
import { PolicySummaryDataSource } from './views/policy-summary/policy-summary-datasource';
import { PolicySummaryComponent } from './views/policy-summary/policy-summary.component';
import { PolicyViewGroupComponent } from './views/policy-view-group/policy-view-group.component';
import { PolicyViewComponent } from './views/policy-view/policy-view.component';
import { PopupSearchDetailComponent } from './views/popup-search-detail/popup-search-detail.component';
import { PremiumListingDocumentSelectionComponent } from './views/premium-listing-document-selection/premium-listing-document-selection.component';
import { PremiumListingDocumentsGroupComponent } from './views/premium-listing-documents-group/premium-listing-documents-group.component';
import { PremiumListingDocumentsMemberComponent } from './views/premium-listing-documents-member/premium-listing-documents-member.component';
import { PremiumListingDocumentsMemberDatasource } from './views/premium-listing-documents-member/premium-listing-documents-member.datasource';
import { PremiumListingMembersComponent } from './views/premium-listing-members/premium-listing-members.component';
import { PremiumListingValidationComponent } from './views/premium-listing-validation/premium-listing-validation.component';
import { PremiumListingComponent } from './views/premium-listing/premium-listing.component';
import { PreviousInsurerComponent } from './views/previous-insurer/previous-insurer.component';
import { ReinstatePolicyDataMigrationComponent } from './views/reinstate-policy-data-migration/reinstate-policy-data-migration.component';
import { ReinstatePolicyDialogComponent } from './views/reinstate-policy-dialog/reinstate-policy-dialog.component';
import { RemoveInsuredLifeNoteComponent } from './views/remove-insured-life-note/remove-insured-life-note.component';
import { RolePlayerBenefitsChildComponent } from './views/role-player-benefits-child/role-player-benefits-child.component';
import { RolePlayerBenefitsChildDataSource } from './views/role-player-benefits-child/role-player-benefits-child.datasource';
import { RolePlayerBenefitsExtendedComponent } from './views/role-player-benefits-extended/role-player-benefits-extended.component';
import { RolePlayerBenefitsExtendedDataSource } from './views/role-player-benefits-extended/role-player-benefits-extended.datasource';
import { RolePlayerBenefitsMemberComponent } from './views/role-player-benefits-member/role-player-benefits-member.component';
import { RolePlayerBenefitsMemberDataSource } from './views/role-player-benefits-member/role-player-benefits-member.datasource';
import { RolePlayerBenefitsSpouseComponent } from './views/role-player-benefits-spouse/role-player-benefits-spouse.component';
import { RolePlayerBenefitsSpouseDataSource } from './views/role-player-benefits-spouse/role-player-benefits-spouse.datasource';
import { RolePlayerBenefitsComponent } from './views/role-player-benefits/role-player-benefits.component';
import { RolePlayerDetailsComponent } from './views/role-player-details/role-player-details.component';
import { RolePlayerListComponent } from './views/role-player-list/role-player-list.component';
import { RolePlayerNotesComponent } from './views/role-player-notes/role-player-notes.component';
import { RolePlayerPersonDialogComponent } from './views/role-player-person-dialog/role-player-person-dialog.component';
import { RolePlayerPolicyNotesComponent } from './views/role-player-policy-notes/role-player-policy-notes.component';
import { RolePlayerViewComponent } from './views/role-player-view/role-player-view.component';
import { SpouseChildrenListComponent } from './views/spouse-children-list/spouse-children-list.component';
import { UploadBulkPaymentListingComponent } from './views/upload-bulk-payment-listing/upload-bulk-payment-listing.component';
import { UploadInsuredLivesComponent } from './views/upload-insured-lives/upload-insured-lives.component';
import { UploadPremiumListingComponent } from './views/upload-premium-listing/upload-premium-listing.component';
import { UploadPremiumPaymentsComponent } from './views/upload-premium-payments/upload-premium-payments.component';
import { VerifyCaseComponent } from './views/verify-case/verify-case.component';
import { ViewGroupPolicyComponent } from './views/view-group-policy/view-group-policy.component';
import { CancelPolicyIndividualWizard } from './wizards/cancel-policy-individual-wizard';
import { ChangePolicyStatusWizard } from './wizards/change-policy-status.wizard';
import { ClientCareNotificationWizard } from './wizards/clientcare-notification-wizard';
import { ConsolidatedFuneralWizard } from './wizards/consolidated-funeral-wizard';
import { MyValuePlusWizard } from './wizards/myvalueplus-wizard';
import { GroupRiskWizard } from './wizards/group-risk-wizard';
import { ContinuePolicyIndividualWizard } from './wizards/continue-policy-wizard';
import { GroupPolicyMemberWizard } from './wizards/group-policy-member-wizard';
import { InsuredLivesWizard } from './wizards/insured-lives-wizard';
import { LapsePolicyWizard } from './wizards/lapse-policy-wizard';
import { PolicyMembersWizard } from './wizards/maintain-policy-members-wizard';
import { ManagePolicyGroupWizard } from './wizards/manage-policy-group-wizard';
import { ManagePolicyIndividualWizard } from './wizards/manage-policy-individual-wizard';
import { MoveBrokerPolicyWizard } from './wizards/move-broker-policy-wizard';
import { MovePolicySchemeWizard } from './wizards/move-policy-scheme.wizard';
import { NewBusinessGroupWizard } from './wizards/new-business-group-wizard';
import { NewBusinessIndividualWizard } from './wizards/new-business-individual-wizard';
import { PremiumListingDocumentsWizard } from './wizards/premium-listing-documents.wizard';
import { PremiumListingWizard } from './wizards/premium-listing-wizard';
import { ReinstatePolicyIndividualWizard } from './wizards/reinstate-policy-wizard';
import { UpgradeDownGradePolicyWizard } from './wizards/upgrade-downgrade-policy-wizard';
import { RMARMLCancelPolicySummaryComponent } from './wizards/policy/cancel/cancel-wizard-steps/rma-rml-cancel-policy-summary/rma-rml-cancel-policy-summary.component';
import { RMARMLCancelPolicyComponent } from './wizards/policy/cancel/cancel-wizard-steps/rma-rml-cancel-policy/rma-rml-cancel-policy.component';
import { RMARMLCancelPolicyWizard } from './wizards/policy/cancel/rma-rml-cancel-policy-wizard';
import { PolicyDetailsWizardComponent } from './wizards/policy/create/policy-wizard-steps/policy-details/policy-details-wizard.component';
import { PolicyInceptionComponent } from './wizards/policy/create/policy-wizard-steps/policy-details/policy-inception/policy-inception.component';
import { PolicyMemberDetailsWizardComponent } from './wizards/policy/create/policy-wizard-steps/policy-member-details/policy-member-details-wizard.component';
import { PolicySchedulePreviewWizardComponent } from './wizards/policy/create/policy-wizard-steps/policy-schedule-preview/policy-schedule-preview-wizard.component';
import { RMAPolicyWizard } from './wizards/policy/create/rma-policy-wizard';
import { RMLPolicyWizard } from './wizards/policy/create/rml-policy-wizard';
import { RMARMLDeclarationComponent } from './wizards/policy/reinstate/reinstate-wizard-steps/rma-rml-declaration/rma-rml-declaration.component';
import { RMARMLReinstatePolicyComponent } from './wizards/policy/reinstate/reinstate-wizard-steps/rma-rml-reinstate-policy/rma-rml-reinstate-policy.component';
import { RMARMLReinstatePolicyWizard } from './wizards/policy/reinstate/rma-rml-reinstate-policy-wizard';
import { RMARMLMaintainPolicyWizard } from './wizards/policy/maintain/rma-rml-maintain-policy-wizard';
import { RMARMLMaintainPolicyComponent } from './wizards/policy/maintain/maintain-wizard-steps/rma-rml-maintain-policy/rma-rml-maintain-policy.component';
import { RMARMLMaintainPolicyDeclarationWizardComponent } from './wizards/policy/maintain/maintain-wizard-steps/policy-details/rma-rml-maintain-policy-declaration-wizard.component';
import { IndustryService } from './shared/Services/industry.service';
import { PremiumPaybackErrorWizard } from './wizards/premium-payback-error-wizard';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { PolicyReportsComponent } from './views/policy-reports/policy-reports.component';
import { ManualQaddComponent } from './views/manual-qadd/manual-qadd.component';
import { UploadMyvalueplusComponent } from './views/upload-myvalueplus/upload-myvalueplus.component';
import { MyvalueplusMembersComponent } from './views/myvalueplus-members/myvalueplus-members.component';
import { MyvalueplusSummaryComponent } from './views/myvalueplus-summary/myvalueplus-summary.component';
import { PolicyChildContactDetailsComponent } from './views/policy-child-contact-details/policy-child-contact-details.component';
import { CreateGroupRiskPoliciesComponent } from './views/create-group-risk-policies/create-group-risk-policies.component';
import { UpdateGroupRiskPoliciesComponent } from './views/update-group-risk-policies/update-group-risk-policies.component';
import { ManageGroupRiskPoliciesWizard } from './wizards/manage-group-risk-policies-wizard';
import { GroupRiskEmployerDetailsComponent} from './views/group-risk-employer-details/group-risk-employer-details.component';
import { GroupRiskCreatePoliciesComponent } from './views/group-risk-create-policies/group-risk-create-policies.component';
import { GroupRiskCreatedPoliciesComponent } from './views/group-risk-created-policies/group-risk-created-policies.component';
import { GroupRiskCreatePolicyBenefitsComponent } from './views/group-risk-create-policy-benefits/group-risk-create-policy-benefits.component';
import { GroupRiskCreatedPolicyBenefitsComponent } from './views/group-risk-created-policy-benefits/group-risk-created-policy-benefits.component';
import { GroupRiskCreateBenefitCategoriesComponent } from './views/group-risk-create-benefit-categories/group-risk-create-benefit-categories.component';
import { GroupRiskCreatedBenefitCategoriesComponent } from './views/group-risk-created-benefit-categories/group-risk-created-benefit-categories.component';
import { GroupRiskNotesComponent } from './views/group-risk-notes/group-risk-notes.component';
import { GroupRiskDocumentsComponent } from './views/group-risk-documents/group-risk-documents.component';
import { UploadExternalPartnerPoliciesComponent } from './views/upload-external-partner-policies/upload-external-partner-policies.component';
import { SearchExternalPartnerPoliciesComponent } from './views/search-external-partner-policies/search-external-partner-policies.component';
import { GroupRiskCreateBenefitCategoryStandardComponent } from './views/group-risk-create-benefit-category-views/standard-benefit/standard-benefit.component';
import { GroupRiskCreateBenefitCategoryCIComponent } from './views/group-risk-create-benefit-category-views/critical-illness/critical-illness.component';
import { GroupRiskCreateBenefitCategoryDeathComponent } from './views/group-risk-create-benefit-category-views/death-benefit/death-benefit.component';
import { GroupRiskCreateBenefitCategoryFuneralComponent } from './views/group-risk-create-benefit-category-views/funeral-benefit/funeral-benefit.component';
import { GroupRiskCreateBenefitCategoryDisabilityComponent } from './views/group-risk-create-benefit-category-views/disability-benefit/disability-benefit.component';
import { GroupRiskCreateBenefitCategoryTTDComponent } from './views/group-risk-create-benefit-category-views/total-temporal-disability-benefit/total-temporal-disability-benefit.component';
import { GroupRiskCreateBenefitCategoryDLSComponent } from './views/group-risk-create-benefit-category-views/disability-lumpsum/disability-lumpsum.component';
import { GroupRiskCreateBenefitCategorySpouseDeathComponent } from './views/group-risk-create-benefit-category-views/spouse-death-benefit/spouse-death-benefit.component';
import {GroupRiskPolicyViewComponent} from './views/group-risk-policy-view/group-risk-policy-view.component';
import { StandardBenefitComponent } from './views/group-risk-create-policy-benefit-views/standard-benefit/standard-benefit.component';
import { FuneralBenefitComponent } from './views/group-risk-create-policy-benefit-views/funeral-benefit/funeral-benefit.component';
import { CriticalIllnessBenefitComponent } from './views/group-risk-create-policy-benefit-views/critical-illness-benefit/critical-illness-benefit.component';
import { SpouseDeathBenefitComponent } from './views/group-risk-create-policy-benefit-views/spouse-death-benefit/spouse-death-benefit.component';
import { DeathBenefitComponent } from './views/group-risk-create-policy-benefit-views/death-benefit/death-benefit.component';
import { DisabilityLumpsumBenefitComponent } from './views/group-risk-create-policy-benefit-views/disability-lumpsum-benefit/disability-lumpsum-benefit.component';
import { TotalTemporaryDisabilityBenefitComponent } from './views/group-risk-create-policy-benefit-views/total-temporary-disability-benefit/total-temporary-disability-benefit.component';
import { DisabilityIncomeBenefitComponent } from './views/group-risk-create-policy-benefit-views/disability-income-benefit/disability-income-benefit.component';
import { GroupRiskReportsComponent } from './views/group-risk-reports/group-risk-reports.component';
import { FuneralCustomScaleComponent } from './views/group-risk-create-benefit-category-views/funeral-benefit/funeral-custom-scale/funeral-custom-scale.component';

@NgModule({
  imports: [
    FrameworkModule,
    ClientCareSharedModule,
    PolicyManagerRoutingModule,
    SearchModule,
    WizardModule,
    MemberManagerModule,
    ChartsModule,
    SharedComponentsLibModule
  ],
  declarations: [
    PolicyManagerHomeComponent,
    PolicyManagerLayoutComponent,
    CreateCaseComponent,
    PersonDetailsComponent,
    RolePlayerDetailsComponent,
    RolePlayerViewComponent,
    PersonDetailsDialogComponent,
    RolePlayerListComponent,
    SpouseChildrenListComponent,
    CreateCaseDocumentsComponent,
    VerifyCaseComponent,
    ExtendedFamilyListComponent,
    RolePlayerPersonDialogComponent,
    PolicyListDialogComponent,
    MainMemberDetailsComponent,
    CasePolicyOptionsComponent,
    PolicyCollectionDetailsComponent,
    PolicyContactDetailsComponent,
    PolicyChildContactDetailsComponent,
    PolicyAddressDetailsComponent,
    PolicyBankingDetailsComponent,
    AddressWizardComponent,
    GroupMemberDetailsComponent,
    GroupPolicyMembersComponent,
    BeneficiaryListComponent,
    RolePlayerNotesComponent,
    RolePlayerPolicyNotesComponent,
    PolicyProductOptionsComponent,
    PremiumListingComponent,
    PolicySummaryComponent,
    PolicyBenefitsComponent,
    PolicyScheduleComponent,
    PolicyLastViewedListComponent,
    RemoveInsuredLifeNoteComponent,
    PolicyViewComponent,
    PolicySearchComponent,
    GroupPolicyBenefitsComponent,
    ReinstatePolicyDataMigrationComponent,
    CancelPolicyReasonDialogComponent,
    PolicyMemberDocumentsComponent,
    PolicyCancellationComponent,
    PolicyViewGroupComponent,
    PolicyInformationComponent,
    PolicyInfoMainMemberComponent,
    MainMemberPolicyListComponent,
    MainMemberPersonComponent,
    PolicyListDialogComponent,
    MovePolicyComponent,
    ReinstatePolicyDialogComponent,
    MainMemberContinuePolicyComponent,
    ContinuePolicyDialogComponent,
    ContinueOutstandingPremiumsComponent,
    UploadPremiumListingComponent,
    UploadPremiumPaymentsComponent,
    RolePlayerBenefitsComponent,
    RolePlayerBenefitsSpouseComponent,
    RolePlayerBenefitsChildComponent,
    RolePlayerBenefitsExtendedComponent,
    RolePlayerBenefitsMemberComponent,
    PremiumListingValidationComponent,
    PremiumListingDocumentsGroupComponent,
    PremiumListingDocumentsMemberComponent,
    PremiumListingDocumentSelectionComponent,
    GroupPolicyCompanyComponent,
    GroupPolicyMainMemberComponent,
    PreviousInsurerComponent,
    MemberContinuePolicyComponent,
    LapsePolicyViewComponent,
    BulkLapsePoliciesComponent,
    BulkCancelPoliciesComponent,
    BulkReinstatePoliciesComponent,
    PolicySchedulePreviewComponent,
    UploadInsuredLivesComponent,
    InsuredLivesComponent,
    InsuredLivesDocumentsGroupComponent,
    InsuredLivesDocumentsMemberComponent,
    InsuredLivesValidationComponent,
    PolicyStatusSummaryComponent,
    UploadBulkPaymentListingComponent,
    GroupPolicyMemberCancellationComponent,
    ChildPolicyAllocationComponent,
    PopupSearchDetailComponent,
    GroupPolicySchemeSourceComponent,
    GroupPolicySchemeTargetComponent,
    ChildPolicySelectionComponent,
    PolicyNotesComponent,
    UploadedFilesComponent,
    FileExceptionsComponent,
    ViewGroupPolicyComponent,
    GroupSchemeProductOptionComponent,
    GroupSchemeBenefitsComponent,
    PolicyAmendmentsComponent,
    MainMemberCancellationComponent,
    UploadConsolidatedFuneralComponent,
    UploadGroupRiskComponent,
    ConsolidatedFuneralSummaryComponent,
    GroupRiskSummaryComponent,
    BulkPolicySendComponent,
    PremiumListingMembersComponent,
    RMARMLCancelPolicyComponent,
    RMARMLReinstatePolicyComponent,
    GroupSchemeChildPoliciesComponent,
    ConsolidatedFuneralMembersComponent,
    GroupRiskMembersComponent,
    PolicyMemberDetailsWizardComponent,
    PolicyDetailsWizardComponent,
    PolicySchedulePreviewWizardComponent,
    PolicyInceptionComponent,
    RMARMLCancelPolicySummaryComponent,
    RMARMLDeclarationComponent,
    RMARMLMaintainPolicyComponent,
    RMARMLMaintainPolicyDeclarationWizardComponent,
    PolicyReportsComponent,
    ManualQaddComponent,
    UploadMyvalueplusComponent,
    MyvalueplusMembersComponent,
    MyvalueplusSummaryComponent,
    CreateGroupRiskPoliciesComponent,
	  UpdateGroupRiskPoliciesComponent,
    GroupRiskEmployerDetailsComponent,
    GroupRiskCreatePoliciesComponent,
    GroupRiskCreatedPoliciesComponent,
    GroupRiskCreatePolicyBenefitsComponent,
    GroupRiskCreatedPolicyBenefitsComponent,
    GroupRiskCreateBenefitCategoriesComponent,
    GroupRiskCreatedBenefitCategoriesComponent,
    GroupRiskNotesComponent,
    GroupRiskDocumentsComponent,
    UploadExternalPartnerPoliciesComponent,
    SearchExternalPartnerPoliciesComponent,
    GroupRiskCreateBenefitCategoryStandardComponent,
    GroupRiskCreateBenefitCategoryCIComponent,
    GroupRiskCreateBenefitCategoryDeathComponent,
    GroupRiskCreateBenefitCategoryFuneralComponent,
    GroupRiskCreateBenefitCategoryDisabilityComponent,
    GroupRiskCreateBenefitCategoryTTDComponent,
    GroupRiskCreateBenefitCategoryDLSComponent,
    GroupRiskCreateBenefitCategorySpouseDeathComponent,
    GroupRiskPolicyViewComponent,
    StandardBenefitComponent,
    FuneralBenefitComponent,
    SpouseDeathBenefitComponent,
    CriticalIllnessBenefitComponent,
    DeathBenefitComponent,
    DisabilityLumpsumBenefitComponent,
    TotalTemporaryDisabilityBenefitComponent,
    DisabilityIncomeBenefitComponent,
    GroupRiskReportsComponent,
    FuneralCustomScaleComponent
  ],
  exports: [],
  entryComponents: [
    PolicyManagerHomeComponent,
    PolicyManagerLayoutComponent,
    CreateCaseComponent,
    PersonDetailsComponent,
    RolePlayerDetailsComponent,
    RolePlayerViewComponent,
    PersonDetailsDialogComponent,
    RolePlayerListComponent,
    SpouseChildrenListComponent,
    ExtendedFamilyListComponent,
    RolePlayerPersonDialogComponent,
    PolicyListDialogComponent,
    CreateCaseDocumentsComponent,
    VerifyCaseComponent,
    MainMemberDetailsComponent,
    CasePolicyOptionsComponent,
    AddressWizardComponent,
    GroupMemberDetailsComponent,
    GroupPolicyMembersComponent,
    PolicyCollectionDetailsComponent,
    PolicyAddressDetailsComponent,
    PolicyContactDetailsComponent,
    PolicyChildContactDetailsComponent,
    PolicyBankingDetailsComponent,
    BeneficiaryListComponent,
    RolePlayerNotesComponent,
    RolePlayerPolicyNotesComponent,
    PremiumListingComponent,
    PolicySummaryComponent,
    PolicyScheduleComponent,
    PolicyLastViewedListComponent,
    RemoveInsuredLifeNoteComponent,
    PolicyViewComponent,
    CancelPolicyReasonDialogComponent,
    PolicyMemberDocumentsComponent,
    PolicyCancellationComponent,
    PolicyViewGroupComponent,
    MainMemberPolicyListComponent,
    MainMemberPersonComponent,
    MovePolicyComponent,
    MainMemberContinuePolicyComponent,
    ContinuePolicyDialogComponent,
    ContinueOutstandingPremiumsComponent,
    ReinstatePolicyDialogComponent,
    PremiumListingValidationComponent,
    PremiumListingDocumentsGroupComponent,
    PremiumListingDocumentsMemberComponent,
    PremiumListingDocumentSelectionComponent,
    PremiumListingComponent,
    GroupPolicyCompanyComponent,
    GroupPolicyMainMemberComponent,
    MemberContinuePolicyComponent,
    LapsePolicyViewComponent,
    PolicySchedulePreviewComponent,
    InsuredLivesComponent,
    InsuredLivesDocumentsGroupComponent,
    InsuredLivesDocumentsMemberComponent,
    InsuredLivesValidationComponent,
    PolicyStatusSummaryComponent,
    GroupPolicyMemberCancellationComponent,
    PopupSearchDetailComponent,
    PopupSearchDetailComponent,
    GroupPolicySchemeSourceComponent,
    GroupPolicySchemeTargetComponent,
    ChildPolicySelectionComponent,
    PolicyNotesComponent,
    PolicyAmendmentsComponent,
    RMARMLCancelPolicyComponent,
    RMARMLCancelPolicySummaryComponent,
    RMARMLReinstatePolicyComponent,
    PolicyMemberDetailsWizardComponent,
    PolicyDetailsWizardComponent,
    PolicySchedulePreviewWizardComponent,
    PolicyInceptionComponent,
    RMARMLDeclarationComponent,
    RMARMLMaintainPolicyComponent,
    RMARMLMaintainPolicyDeclarationWizardComponent,
    CreateGroupRiskPoliciesComponent,
	  UpdateGroupRiskPoliciesComponent,
    GroupRiskEmployerDetailsComponent,
    GroupRiskCreatePoliciesComponent,
    GroupRiskCreatedPoliciesComponent,
    GroupRiskCreatePolicyBenefitsComponent,
    GroupRiskCreatedPolicyBenefitsComponent,
    GroupRiskCreateBenefitCategoriesComponent,
    GroupRiskCreatedBenefitCategoriesComponent,
    GroupRiskCreateBenefitCategoryStandardComponent,
    GroupRiskCreateBenefitCategoryCIComponent,
    GroupRiskPolicyViewComponent,
    StandardBenefitComponent,
    FuneralBenefitComponent,
    SpouseDeathBenefitComponent,
    CriticalIllnessBenefitComponent,
    DeathBenefitComponent,
    DisabilityLumpsumBenefitComponent,
    TotalTemporaryDisabilityBenefitComponent,
    DisabilityIncomeBenefitComponent
  ],
  bootstrap: [],
  providers: [
    BreadcrumbPolicyService,
    BreadcrumbClientService,
    BrokerageService,
    RepresentativeService,
    RequiredDocumentService,
    RolePlayerService,
    RolePlayerDataSource,
    RolePlayerAddressDetailDataSource,
    RolePlayerBankingDetailDataSource,
    BenefitService,
    ProductOptionService,
    PolicyBenefitsDataSource,
    PolicySummaryDataSource,
    PolicyScheduleDataSource,
    PolicyLastViewedListDataSource,
    CaseService,
    GroupPolicyBenefitsDataSource,
    PolicyMemberDocumentsDataSource,
    PolicyCancellationDataSource,
    MoveBrokerPolicyDataSource,
    GroupPolicyMembersDatasource,
    PremiumListingDocumentsMemberDatasource,
    RolePlayerBenefitsSpouseDataSource,
    RolePlayerBenefitsChildDataSource,
    RolePlayerBenefitsExtendedDataSource,
    RolePlayerBenefitsMemberDataSource,
    PremiumListingService,
    FuneralPolicyPremiumService,
    LoginService,
    PolicyProcessService,
    DeclarationService,
    PolicyService,
    InterBankTransferService,
    GroupPolicyMemberCancellationDatasource,
    GroupPolicySchemeService,
    PolicyChildDataSource,
    PolicyAmendmentsDatasource,
    BulkPolicySendService,
    PremiumListingMemberDatasource,
    IndustryService
  ]
})

export class PolicyManagerModule {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    wizardContextFactory: WizardContextFactory
  ) {
    wizardContextFactory.addWizardContext(new NewBusinessIndividualWizard(componentFactoryResolver), 'new-business-individual');
    wizardContextFactory.addWizardContext(new NewBusinessGroupWizard(componentFactoryResolver), 'new-business-group');
    wizardContextFactory.addWizardContext(new PremiumListingWizard(componentFactoryResolver), 'premium-listing');
    wizardContextFactory.addWizardContext(new PremiumListingDocumentsWizard(componentFactoryResolver), 'premium-listing-documents');
    wizardContextFactory.addWizardContext(new ConsolidatedFuneralWizard(componentFactoryResolver), 'cfp-onboarding');
    wizardContextFactory.addWizardContext(new MyValuePlusWizard(componentFactoryResolver), 'mvp-onboarding');

    wizardContextFactory.addWizardContext(new GroupRiskWizard(componentFactoryResolver), 'grouprisk-onboarding');
    wizardContextFactory.addWizardContext(new ManagePolicyIndividualWizard(componentFactoryResolver), 'manage-policy-individual');
    wizardContextFactory.addWizardContext(new ManagePolicyGroupWizard(componentFactoryResolver), 'manage-policy-group');
    wizardContextFactory.addWizardContext(new CancelPolicyIndividualWizard(componentFactoryResolver), 'cancel-policy-individual');
    wizardContextFactory.addWizardContext(new PolicyMembersWizard(componentFactoryResolver), 'maintain-policy-members');
    wizardContextFactory.addWizardContext(new MoveBrokerPolicyWizard(componentFactoryResolver), 'move-broker-policies');
    wizardContextFactory.addWizardContext(new ReinstatePolicyIndividualWizard(componentFactoryResolver), 'reinstate-policy');
    wizardContextFactory.addWizardContext(new ContinuePolicyIndividualWizard(componentFactoryResolver), 'continue-policy');
    wizardContextFactory.addWizardContext(new ManagePolicyGroupWizard(componentFactoryResolver), 'cancel-policy-group');
    wizardContextFactory.addWizardContext(new GroupPolicyMemberWizard(componentFactoryResolver), 'maintain-group-member');
    wizardContextFactory.addWizardContext(new LapsePolicyWizard(componentFactoryResolver), 'lapse-policy');
    wizardContextFactory.addWizardContext(new PremiumPaybackErrorWizard(componentFactoryResolver), 'policy-premium-payback-errors');
    wizardContextFactory.addWizardContext(new ManageGroupRiskPoliciesWizard(componentFactoryResolver), 'manage-group-risk-policies');

    wizardContextFactory.addWizardContext(new RMAPolicyWizard(componentFactoryResolver), 'rma-policy');
    wizardContextFactory.addWizardContext(new RMLPolicyWizard(componentFactoryResolver), 'rml-policy');
    wizardContextFactory.addWizardContext(new RMARMLCancelPolicyWizard(componentFactoryResolver), 'rma-rml-policy-cancellation');
    wizardContextFactory.addWizardContext(new RMARMLReinstatePolicyWizard(componentFactoryResolver), 'rma-rml-policy-reinstatement');
    wizardContextFactory.addWizardContext(new RMARMLMaintainPolicyWizard(componentFactoryResolver), 'rma-rml-policy-maintanance');

    wizardContextFactory.addWizardContext(new InsuredLivesWizard(componentFactoryResolver), 'insured-lives');
    wizardContextFactory.addWizardContext(new ChangePolicyStatusWizard(componentFactoryResolver), 'change-policy-status');
    wizardContextFactory.addWizardContext(new ClientCareNotificationWizard(componentFactoryResolver), 'clientcare-notification');
    wizardContextFactory.addWizardContext(new MovePolicySchemeWizard(componentFactoryResolver), 'move-policy-scheme');
    wizardContextFactory.addWizardContext(new UpgradeDownGradePolicyWizard(componentFactoryResolver), 'upgrade-downgrade-policy');
  }
}
