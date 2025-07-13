import { EventWizard } from './views/event-case-manager/event-case-wizard/event-case-wizard';
// Thrid party
import { DatePipe } from '@angular/common';
import { NgModule, ComponentFactoryResolver, Injector } from '@angular/core';

// Additional
import { FrameworkModule } from 'src/app/framework.module';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/public-api';
import { ClaimManagerRoutingModule } from './claim-manager-routing.module';
import { BeneficiaryBankingDetailsComponent } from './views/funeral/beneficiary-banking-details/beneficiary-banking-details.component';
import { BodyCollectionComponent } from './views/funeral/body-collection/body-collection.component';
import { ClaimPaymentComponent } from './views/funeral/claim-payment/claim-payment.component';
import { ForensicPathologistComponent } from './views/funeral/forensic-pathologist/forensic-pathologist.component';
import { FuneralParlorComponent } from './views/funeral/funeral-parlor/funeral-parlor.component';
import { InformantComponent } from './views/funeral/informant/informant.component';
import { LandingSearchComponent } from './views/landing-search/landing-search.component';
import { MedicalPractitionerComponent } from './views/funeral/medical-practitioner/medical-practitioner.component';
import { RegisterFuneralComponent } from './views/funeral/register-funeral/register-funeral.component';
import { UndertakerComponent } from './views/funeral/undertaker/undertaker.component';
import { ClaimsPolicyDetailComponent } from './views/claim-policy-detail/claims-policy-detail.component';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { ClaimHomeComponent } from './views/claim-home/claim-home.component';
import { ClaimLayoutComponent } from './views/claim-layout/claim-layout.component';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { InsuredLifeService } from 'projects/clientcare/src/app/policy-manager/shared/Services/insured-life.service';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { AdditionalRegistryDetailsComponent } from 'projects/claimcare/src/app/claim-manager/views/funeral/additional-registry-details/additional-registry-details.component';
import { AddBeneficiaryBankingDetailsComponent } from './views/funeral/add-beneficiary-banking-details/add-beneficiary-banking-details.component';
import { MigratedClaimComponent } from './views/funeral/migrated-claim/migrated-claim.component';
import { ClaimNotesComponent } from './views/claim-notes/claim-notes.component';
import { WorkpoolNotesComponent } from './views/claim-notes/workpool-notes.component';
import { DeclineClaimComponent } from './views/funeral/decline-claim/decline-claim.component';
import { CancelClaimComponent } from './views/funeral/cancel-claim/cancel-claim.component';
import { ReOpenClaimComponent } from './views/funeral/reopen-claim/reopen-claim.component';
import { ClaimRepayComponent } from './views/funeral/claim-repay/claim-repay.component';
import { BankBranchService } from 'projects/clientcare/src/app/client-manager/shared/services/bank-branch.service';
import { ReverseClaimPaymentComponent } from './views/funeral/reverse-claim-payment/reverse-claim-payment.component';
import { RegisterFuneralWizard } from './views/funeral/register-funeral-wizard/register-funeral-wizard';
import { ClaimsDocumentsComponent } from 'projects/claimcare/src/app/claim-manager/views/funeral/claims-document/claims-document.component';
import { ClaimsBeneficiaryBankingDetailComponent } from './views/funeral/claims-beneficiary-banking-detail/claims-beneficiary-banking-detail.component';
import { EventCaseHomeComponent } from './views/event-case-manager/event-case-home/event-case-home.component';
import { EventCaseLayoutComponent } from './views/event-case-manager/event-case-layout/event-case-layout.component';
import { EventCaseMenuComponent } from './views/event-case-manager/event-case-menu/event-case-menu.component';
import { EventDetailsComponent } from './views/event-case-manager/event-details/event-details.component';
import { SearchEventComponent } from './views/event-case-manager/search-event/search-event.component';
import { EventComponent } from './views/event-case-manager/event/event.component';
import { EventNotesComponent } from './views/event-case-manager/event-notes/event-notes.component';
import { PersonEventComponent } from './views/event-case-manager/person-event/person-event.component';
import { PersonEventDeathComponent } from './views/event-case-manager/person-event-death/person-event-death.component';
import { PersonEventAccidentComponent } from './views/event-case-manager/person-event-accident/person-event-accident.component';
import { SearchPolicyComponent } from './views/funeral/search-policy/search-policy.component';
import { ManageClaimComponent } from './views/funeral/manage-claim/manage-claim.component';
import { AddPersonEventsComponent } from './views/event-case-manager/add-person-events/add-person-events.component';
import { SearchEventDataSource } from './views/event-case-manager/search-event/search-event.datasource';
import { EventSummaryComponent } from './views/event-case-manager/event-summary/event-summary.component';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { AddEventComponent } from './views/event-case-manager/add-event/add-event.component';
import { RegisterFuneralClaimComponent } from './views/funeral/register-funeral-claim/register-funeral-claim.component';
import { BrokerageService } from 'projects/clientcare/src/app/broker-manager/services/brokerage.service';
import { AddMemberStillbornComponent } from './views/funeral/add-member-stillborn/add-member-stillborn.component';
import { FuneralClaimDetailsComponent } from './views/funeral/funeral-claim-details/funeral-claim-details.component';
import { ClaimBankAccountComponent } from './wizards/banking-details-wizard/claim-bank-account/claim-bank-account.component';
import { ClaimOverviewComponent } from './views/claim-overview/claim-overview.component';
import { ChartsModule } from 'ng2-charts';
import { AddClaimantDetailsComponent } from './views/funeral/add-claimant-details/add-claimant-details.component';
import { ClaimTableProductivityComponent } from 'projects/claimcare/src/app/claim-manager/views/dashboards/claim-table-productivity/claim-table-productivity.component';
import { ClaimViewComponent } from './views/claim-view/claim-view.component';
import { CloseClaimComponent } from './views/funeral/close-claim/close-claim.component';
import { BreadcrumbPolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/breadcrumb-policy.service';
import { ClaimantComponent } from './views/funeral/claimant/claimant.component';
import { ClaimDetailsComponent } from './views/claim-details/claim-details.component';
import { SearchClaimantPolicyComponent } from './views/funeral/search-claimant-policy/search-claimant-policy.component';
import { NewMemberClaimantComponent } from './wizards/new-member-approval-wizard/new-member-claimant/new-member-claimant.component';
import { MemberApprovalWizard } from './wizards/new-member-approval-wizard/new-member-approval-wizard';
import { ClaimBeneficiaryBankingWizard } from './wizards/claim-beneficiary-wizard/claim-benficiary-wizard';
import { CreateBankingDetailsWizard } from './wizards/banking-details-wizard/create-banking-details-wizard';
import { UpdateBankingDetailsWizard } from './wizards/banking-details-wizard/update-banking-details-wizard';
import { ClaimDashboardComponent } from './views/claim-dashboard/claim-dashboard.component';
import { ClaimRecoveryComponent } from './views/funeral/claim-recovery/claim-recovery.component';
import { RejectionNotificationComponent } from './views/rejection-notification/rejection-notification.component';
import { RejectionNotificationWizard } from './wizards/rejection-notification-wizard';
import { ClaimSmsAuditComponent } from './views/claim-sms-audit/claim-sms-audit.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ClaimantRecoveryWizard } from './wizards/claimant-recovery-wizard/claimant-recovery-wizard';
import { ClaimantRecoveryReasonComponent } from './wizards/claimant-recovery-wizard/claimant-recovery-reason/claimant-recovery-reason.component';
import { ClaimantRecoveryDocumentComponent } from './wizards/claimant-recovery-wizard/claimant-recovery-document/claimant-recovery-document.component';
import { ClaimantRecoveryBeneficiaryComponent } from './wizards/claimant-recovery-wizard/claimant-recovery-beneficiary/claimant-recovery-beneficiary.component';
import { FuneralTracingWizard } from './wizards/funeral-tracing-wizard/funeral-tracing-wizard';
import { ClaimTracerComponent } from './wizards/funeral-tracing-wizard/claim-tracer/claim-tracer.component';
import { ClaimInvestigationWizard } from './wizards/claim-investigation-wizard/claim-investigation-wizard';
import { ClaimInvestigationDocumentComponent } from './wizards/claim-investigation-wizard/claim-investigation-documents/claim-investigation-document.component';
import { ClaimInvestigationNoteComponent } from './wizards/claim-investigation-wizard/claim-investigation-note/claim-investigation-note.component';
import { TraceDocumentComponent } from './wizards/trace-document/trace-document/trace-document.component';
import { TraceDocumentWizard } from './wizards/trace-document/trace-document-wizard';
import { TracerListComponent } from './views/tracer-list/tracer-list.component';
import { TraceDetailsComponent } from './views/tracer-list/trace-details/trace-details.component';
import { TraceInvoiceComponent } from './views/tracer-list/trace-invoice/trace-invoice.component';
import { ClaimInvestigationClaimsDocumentComponent } from './wizards/claim-investigation-wizard/claim-investigation-claim-documents/claim-investigation-claim-documents.component';
import { RolePlayerDialogBankingDetailsComponent } from './wizards/banking-details-wizard/role-player-dialog-banking-details/role-player-dialog-banking-details.component';
import { ClaimAccidentWizard } from './wizards/claim-accident-wizard/claim-accident-wizard';
import { ClaimIncidentDetailsWizardComponent } from './wizards/claim-accident-wizard/claim-incident-details-wizard/claim-incident-details-wizard.component';
import { ClaimClaimantDetailsWizardComponent } from './wizards/claim-accident-wizard/claim-claimant-details-wizard/claim-claimant-details-wizard.component';
import { ClaimInsuranceDetailsWizardComponent } from './wizards/claim-accident-wizard/claim-insurance-details-wizard/claim-insurance-details-wizard.component';
import { ClaimInsuranceDetailsComponent } from './views/claim-insurance-details/claim-insurance-details.component';
import { ClaimClaimantDetailsComponent } from './views/claim-claimant-details/claim-claimant-details.component';
import { ClaimIncidentDetailsComponent } from './views/claim-incident-details/claim-incident-details.component';
import { ClaimDiseaseDetailsComponent } from './views/claim-disease-details/claim-disease-details.component';
import { ClaimAccidentDocumentWizardComponent } from './wizards/claim-accident-wizard/claim-accident-document-wizard/claim-accident-document-wizard.component';
import { ClaimDiseaseDetailsWizardComponent } from './wizards/claim-disease-wizard/claim-disease-details-wizard/claim-disease-details-wizard.component';
import { ClaimDiseaseWizard } from './wizards/claim-disease-wizard/claim-disease-wizard';
import { ClaimEmployeeDetailsComponent } from './views/claim-employee-details/claim-employee-details.component';
import { ClaimMemberSearchComponent } from './views/claim-member-search/claim-member-search.component';
import { MemberManagerModule } from 'projects/clientcare/src/app/member-manager/member-manager.module';
import { ClaimNotificationDocumentsComponent } from './views/claim-notification-documents/claim-notification-documents.component';
import { ClaimMedicalReportDetailsComponent } from './views/claim-medical-report-details/claim-medical-report-details.component';
import { ClaimNotificationAuditComponent } from './views/claim-notification-audit/claim-notification-audit.component';
import { PersonEventEmailAuditComponent } from './views/person-event-email-audit/person-event-email-audit.component';
import { AccidentDiseaseNotificationWizard } from './wizards/accident-disease-notification/accident-disease-notification-wizard';
import { PersonEventSmsAuditComponent } from './views/person-event-sms-audit/person-event-sms-audit.component';
import { ClaimNotificationMedicalViewComponent } from './views/claim-notification-medical-view/claim-notification-medical-view.component';
import { RolePlayerDialogRegistrationNumberComponent } from './views/funeral/role-player-dialog-registration-number/role-player-dialog-registration-number.component';
import { DiseaseIncidentNotificationWizard } from './wizards/disease-incident-notification/disease-incident-notification-wizard';
import { PopupIcd10AdditionalComponent } from './views/popup-icd10-additional/popup-icd10-additional.component';
import { CadPoolDataSource } from './views/work-pools/cad-pool/cad-pool.datasource';
import { CadPoolComponent } from './views/work-pools/cad-pool/cad-pool.component';
import { EmployeeQuestionnaireComponent } from './views/employee-questionnaire/employee-questionnaire.component';
import { PopupQuestionnaireDeleteComponent } from './views/popup-questionnaire-delete/popup-questionnaire-delete.component';
import { CoidDashboardComponent } from './views/dashboards/coid-dashboard/coid-dashboard.component';
import { VopdOverviewComponent } from './views/dashboards/vopd-overview/vopd-overview.component';
import { CoidTableDashboardComponent } from './views/dashboards/coid-table-dashboard/coid-table-dashboard.component';
import { ClaimClaimantAddressWizardComponent } from './wizards/claim-accident-wizard/claim-claimant-address-wizard/claim-claimant-address-wizard.component';
import { ExitReasonDashboardComponent } from './views/exit-reason-dashboard/exit-reason-dashboard.component';
import { RemoveFromStpComponent } from './views/remove-from-stp/remove-from-stp.component';
import { ExitReasonDescriptionComponent } from './views/exit-reason-description/exit-reason-description.component';
import { ClaimAuditViewComponent } from './views/claim-audit-view/claim-audit-view.component';
import { CmcPoolDataSource } from './views/work-pools/cmc-pool/cmc-pool.datasource';
import { CmcPoolComponent } from './views/work-pools/cmc-pool/cmc-pool.component';
import { InvestigationPoolComponent } from './views/work-pools/investigation-pool/investigation-pool.component';
import { EarningsAssessorPoolComponent } from './views/work-pools/earnings-assessor-pool/earnings-assessor-pool.component';
import { VariableEarningsComponent } from './views/claim-earnings/capture-earnings/variable-earnings/variable-earnings.component';
import { NonVariableEarningsComponent } from './views/claim-earnings/capture-earnings/non-variable-earnings/non-variable-earnings.component';
import { OtherEarningTypeModal } from './views/claim-earnings/capture-earnings/other-earning-type-modal/other-earning-type-modal.component';
import { CmcVopdNotificationWizard } from './wizards/cmc-vopd-notification-wizard/cmc-vopd-notification-wizard';
import { ExitReasonDialogComponent } from './views/exit-reason-dialog/exit-reason-dialog.component';
import { ProcessStpMessagesComponent } from './views/process-stp-messages/process-stp-messages.component';
import { BeneficiaryService } from 'projects/clientcare/src/app/policy-manager/shared/Services/beneficiary.service';
import { ClientCareSharedModule } from 'projects/clientcare/src/app/shared/clientcare.shared.module';
import { ClaimCareSharedModule } from './shared/claim-care-shared/claim-care-shared.module';
import { CaptureEarningsComponent } from './views/claim-earnings/capture-earnings/capture-earnings.component';
import { Section40NotificationWizard } from './wizards/section-40-notification/section-40-notification-wizard';
import { ClaimBeneficiaryComponent } from './wizards/claim-beneficiary-wizard/claim-beneficiary/claim-beneficiary.component';
import { StmOverviewComponent } from './views/dashboards/stm-overview/stm-overview.component';
import { ClaimTableDashboardComponent } from './views/dashboards/claim-table-dashboard/claim-table-dashboard.component';
import { ClaimTableTurnaroundComponent } from './views/dashboards/claim-table-turnaround/claim-table-turnaround.component';
import { ClaimTeamProductivityComponent } from './views/dashboards/claim-team-productivity/claim-team-productivity.component';
import { ClaimTurnaroundComponent } from './views/dashboards/claim-turnaround/claim-turnaround.component';
import { AllocateClaimUserComponent } from './views/work-pools/claim-workpool/allocate-claim-user/allocate-claim-user.component';
import { ClaimWorkpoolComponent } from './views/work-pools/claim-workpool/claim-workpool.component';
import { ManageClaimUserShowClaimsComponent } from './views/work-pools/claim-workpool/manage-claim-user/manage-claim-user-show-claims.component';
import { ManageClaimUserComponent } from './views/work-pools/claim-workpool/manage-claim-user/manage-claim-user.component';
import { ReAllocateClaimUserComponent } from './views/work-pools/claim-workpool/re-allocate-claim-user/re-allocate-claim-user.component';
import { NewMemberApprovalComponent } from './wizards/new-member-approval-wizard/new-member-approval/new-member-approval.component';
import { WorkPoolContainerComponent } from './views/work-pools/work-pool-container/work-pool-container.component';
import { WorkPoolFilterComponent } from './views/work-pools/work-pool-filter/work-pool-filter.component';
import { EmployerWorkPoolComponent } from './views/work-pools/coid-work-pool/employer-work-pool.component';
import { CoidWorkPoolMoreInforDialogComponent } from './views/work-pools/coid-work-pool/coid-work-pool-more-infor-dialog/coid-work-pool-more-infor-dialog.component';
import { ClaimsPaymentRecallComponent } from './views/claims-payment-recall/claims-payment-recall.component';
import { MonthlyscheduleWorkPoolUserComponent } from './views/work-pools/claim-workpool/monthly-schedule-work-pool-user/monthly-schedule-work-pool-user.component';
import { MonthlyScheduledWorkPoolUserViewComponent } from './views/work-pools/claim-workpool/monthly-schedule-work-pool-user/monthly-scheduled-work-pool-user-view/monthly-scheduled-work-pool-user-view.component';
import { CloseAccidentClaimComponent } from './views/close-accident-claim/close-accident-claim.component';
import { CadDocumentRequestWizard } from './wizards/cad-document-request-wizard/cad-document-request-wizard';
import { GatherDocumentsStepComponent } from './wizards/gather-documents-step/gather-documents-step.component';
import { ReOpenReasonDialogComponent } from './views/re-open-reason-dialog/re-open-reason-dialog.component';
import { ClaimMedicalAdvisorCoid } from './wizards/medical-advisor/medical-advisor-steps/claim-medical-advisor-coid/claim-medical-advisor-coid.component';
import { ClaimMedicalAdvisorCoidWizard } from './wizards/medical-advisor/medical-advisor-steps/claim-medical-advisor-coid-wizard';
import { ClaimEarningsValidationWizard } from 'projects/claimcare/src/app/claim-manager/wizards/claim-earnings-validation/claim-earnings-validation-wizard'
import { ClaimEarningsValidation } from 'projects/claimcare/src/app/claim-manager/wizards/claim-earnings-validation/claim-earnings-validation-steps/claim-earnings-validation/claim-earnings-validation.component';
import { ClaimAbove30percentpdSCAWizard } from './wizards/claim-above30percentpd-sca-wizard/claim-above30percentpd-sca-wizard';
import { ClaimAbove30percentpdSCA } from './wizards/claim-above30percentpd-sca-wizard/claim-above30percentpd-sca-steps/claim-above30percentpd-sca/claim-above30percentpd-sca.component';
import { ClaimPensionPMCA } from './wizards/claim-pension-pmca-wizard/claim-pension-pmca-steps/claim-pension-pmca/claim-pension-pmca.component';
import { ClaimPensionPMCAWizard } from './wizards/claim-pension-pmca-wizard/claim-pension-pmca-wizard';
import { ClaimSection51Wizard } from './wizards/claim-section51-wizard/claim-section51-wizard';
import { ClaimSection51 } from './wizards/claim-section51-wizard/claim-section51-steps/claim-section51/claim-section51.component';
import { ClaimScaValidateWizard } from './wizards/claim-SCA/claim-sca-validate-wizard';
import { ClaimScaValidate } from './wizards/claim-SCA/claim-SCA-steps/claim-sca-validate/claim-sca-validate.component';
import { ClaimCcaValidateWizard } from './wizards/claim-CCA/claim-CCA-steps/claim-cca-validate-wizard';
import { ClaimCcaValidate } from './wizards/claim-CCA/claim-CCA-steps/claim-cca-validate/claim-cca-validate.component';
import { ClaimPaymentReversalWizard } from './wizards/claim-payment-reversal-wizard/claim-payment-reversal-wizard';
import { ClaimPaymentReversalComponent } from './wizards/claim-payment-reversal-wizard/claim-payment-reversal-steps/claim-payment-reversal/claim-payment-reversal.component';
import { CADRequestInvoicePaymentWizard } from 'projects/claimcare/src/app/claim-manager/wizards/cad-request-invoice-payment/cad-request-invoice-payment-wizard';
import { CADRequestInvoicePayment } from 'projects/claimcare/src/app/claim-manager/wizards/cad-request-invoice-payment/cad-request-invoice-payment-steps/cad-request-invoice-payment/cad-request-invoice-payment.component';
import { TTDNearing18Months } from './wizards/ttd-nearing-18months/ttd-nearing-18months-steps/ttd-nearing-18months/ttd-nearing-18months.component';
import { TTDNearing18MonthsWizard } from './wizards/ttd-nearing-18months/ttd-nearing-18months-wizard';
import { MedicalReportMismatchWizard } from './wizards/medical-report-mismatch-wizard/medical-report-mismatch-wizard';
import { MedicalReportMismatch } from './wizards/medical-report-mismatch-wizard/medical-report-mismatch-wizard-steps/medical-report-mismatch-wizard/medical-report-mismatch.component';
import { InvoicePaySCAWizard } from './wizards/invoice-pay-sca/invoice-pay-sca-steps/invoice-pay-sca-wizard';
import { InvoicePaySCA } from './wizards/invoice-pay-sca/invoice-pay-sca-steps/invoice-pay-sca/invoice-pay-sca.component';
import { CaptureEarnings } from './wizards/capture-earnings-wizard/capture-earnings-wizard-steps/capture-earnings-step/capture-earnings.component';
import { CaptureEarningsWizard } from './wizards/capture-earnings-wizard/capture-earnings-wizard';
import { CaptureEarningsOverrideWizard } from './wizards/capture-earnings-wizard/capture-earnings-override-wizard';
import { ClaimDisabilityAssessmentApproval } from './wizards/disability-assessment-approval/disability-assessment-approval-steps/disability-assessment-approval/disability-assessment-approval.component';
import { ClaimDisabilityAssessmentApprovalWizard } from './wizards/disability-assessment-approval/disability-assessment-approval-wizard';
import { ClaimInvestigationCoidWizard } from './wizards/claim-investigation-coid-wizard/claim-investigation-coid-wizard';
import { ClaimInvestigationCoidComponent } from './wizards/claim-investigation-coid-wizard/steps/claim-investigation-coid.component';
import { Section40InvestigationComponent } from './wizards/section-40-notification/steps/section40-investigation.component';
import { LiabilityDecisionDialogComponent } from './shared/claim-care-shared/claim-holistic-view/holistic-person-event-list/liability-decision-dialog/liability-decision-dialog.component';
import { ClaimComplianceComponent } from './wizards/claim-compliance-wizard/steps/claim-compliance.component';
import { ClaimComplianceWizard } from './wizards/claim-compliance-wizard/claim-compliance-wizard';
import { UploadFinalMedicalReportCCA } from './wizards/upload-final-medical-report-cca/upload-final-medical-report-cca-steps/upload-final-medical-report-cca/upload-final-medical-report-cca.component';
import { UploadFinalMedicalReportCCAWizard } from './wizards/upload-final-medical-report-cca/upload-final-medical-report-cca-wizard';
import { ReviewInjuryIcd10CodeWizard } from './wizards/review-injury-icd10-code/review-injury-icd10-code-wizard';
import { ReviewInjuryIcd10CodeComponent } from './wizards/review-injury-icd10-code/review-injury-icd10-code-wizard-steps/review-injury-icd10-code.component';
import { MmiExpiryExtensionWizard } from './wizards/mmi-expiry-extension-wizard/mmi-expiry-extension-wizard';
import { MmiExpiryExtensionComponent } from './wizards/mmi-expiry-extension-wizard/mmi-expiry-extension-wizard-steps/mmi-expiry-extension.component';
import { DisabilityToFatalAssessComponent } from './wizards/disability-to-fatal/disability-to-fatal-assess/disability-to-fatal-assess.component';
import { DisabilityToFatalWizard } from './wizards/disability-to-fatal/disability-to-fatal-wizard';
import { CaptureEarningsSection51Wizard } from './wizards/capture-earnings-wizard/capture-earnings-section-51-wizard';
import { CaptureEarningsSection51 } from './wizards/capture-earnings-wizard/capture-earnings-wizard-steps/capture-earnings-section-51-step/capture-earnings-section-51.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ClaimLiabilityApprovalComponent } from './wizards/claim-liability-approval-wizard/claim-liability-approval-steps/claim-liability-approval.component';
import { ClaimLiabilityApprovalWizard } from './wizards/claim-liability-approval-wizard/claim-liability-approval-wizard';
import { UploadSection90ReviewReportWizard } from './wizards/upload-section90-review-report-wizard/upload-section90-review-report-wizard';
import { UploadSection90ReviewReportComponent } from './wizards/upload-section90-review-report-wizard/upload-section90-review-report-steps/upload-section90-review-report.component';
import { PaymentAuthorisationRequestWizard } from './wizards/payment-authorisation-request-wizard/payment-authorisation-request-wizard';
import { PaymentAuthorisationRequest } from './wizards/payment-authorisation-request-wizard/payment-authorisation-request-steps/payment-authorisation-step/payment-authorisation-request.component';

@NgModule({
    imports: [
        FrameworkModule,
        ClaimManagerRoutingModule,
        WizardModule,
        ChartsModule,
        SharedModule,
        MemberManagerModule,
        ClientCareSharedModule,
        ClaimCareSharedModule
    ],
    declarations: [
        ClaimHomeComponent,
        ClaimLayoutComponent,
        AllocateClaimUserComponent,
        BeneficiaryBankingDetailsComponent,
        BodyCollectionComponent,
        ForensicPathologistComponent,
        FuneralParlorComponent,
        InformantComponent,
        LandingSearchComponent,
        ManageClaimUserComponent,
        MedicalPractitionerComponent,
        ReAllocateClaimUserComponent,
        RegisterFuneralComponent,
        SearchPolicyComponent,
        UndertakerComponent,
        ClaimPaymentComponent,
        ClaimsBeneficiaryBankingDetailComponent,
        AdditionalRegistryDetailsComponent,
        AddBeneficiaryBankingDetailsComponent,
        MigratedClaimComponent,
        WorkpoolNotesComponent,
        ClaimNotesComponent,
        DeclineClaimComponent,
        ManageClaimUserShowClaimsComponent,
        CancelClaimComponent,
        ReOpenClaimComponent,
        ReverseClaimPaymentComponent,
        ClaimsDocumentsComponent,
        ClaimWorkpoolComponent,
        EventCaseHomeComponent,
        EventCaseLayoutComponent,
        EventCaseMenuComponent,
        EventDetailsComponent,
        SearchEventComponent,
        EventComponent,
        EventNotesComponent,
        PersonEventComponent,
        PersonEventDeathComponent,
        PersonEventAccidentComponent,
        ManageClaimComponent,
        AddPersonEventsComponent,
        EventSummaryComponent,
        AddEventComponent,
        RegisterFuneralClaimComponent,
        FuneralClaimDetailsComponent,
        ClaimBankAccountComponent,
        AddMemberStillbornComponent,
        ClaimDashboardComponent,
        ClaimOverviewComponent,
        ClaimTeamProductivityComponent,
        ClaimTurnaroundComponent,
        AddClaimantDetailsComponent,
        ClaimTableDashboardComponent,
        ClaimTableProductivityComponent,
        ClaimTableTurnaroundComponent,
        ClaimViewComponent,
        CloseClaimComponent,
        ClaimantComponent,
        ClaimDetailsComponent,
        NewMemberApprovalComponent,
        NewMemberClaimantComponent,
        SearchClaimantPolicyComponent,
        ClaimRecoveryComponent,
        ClaimRepayComponent,
        RejectionNotificationComponent,
        ClaimNotificationAuditComponent,
        ClaimSmsAuditComponent,
        ClaimsPolicyDetailComponent,
        ClaimantRecoveryReasonComponent,
        ClaimantRecoveryDocumentComponent,
        ClaimantRecoveryBeneficiaryComponent,
        ClaimTracerComponent,
        ClaimantRecoveryBeneficiaryComponent,
        ClaimInvestigationDocumentComponent,
        ClaimInvestigationNoteComponent,
        TracerListComponent,
        TraceDetailsComponent,
        TraceDocumentComponent,
        TraceInvoiceComponent,
        ClaimInvestigationClaimsDocumentComponent,
        RolePlayerDialogBankingDetailsComponent,
        ClaimIncidentDetailsWizardComponent,
        ClaimClaimantDetailsWizardComponent,
        ClaimInsuranceDetailsWizardComponent,
        ClaimInsuranceDetailsComponent,
        ClaimClaimantDetailsComponent,
        ClaimIncidentDetailsComponent,
        ClaimDiseaseDetailsComponent,
        ClaimAccidentDocumentWizardComponent,
        ClaimEmployeeDetailsComponent,
        ClaimAccidentDocumentWizardComponent,
        ClaimDiseaseDetailsWizardComponent,
        ClaimMemberSearchComponent,
        ClaimNotificationDocumentsComponent,
        ClaimMedicalReportDetailsComponent,
        PersonEventEmailAuditComponent,
        PersonEventSmsAuditComponent,
        ClaimNotificationMedicalViewComponent,
        RolePlayerDialogRegistrationNumberComponent,
        PopupIcd10AdditionalComponent,
        CadPoolComponent,
        EmployeeQuestionnaireComponent,
        PopupQuestionnaireDeleteComponent,
        CoidDashboardComponent,
        VopdOverviewComponent,
        StmOverviewComponent,
        CoidTableDashboardComponent,
        ClaimClaimantAddressWizardComponent,
        ExitReasonDashboardComponent,
        ExitReasonDescriptionComponent,
        RemoveFromStpComponent,
        ClaimAuditViewComponent,
        CmcPoolComponent,
        InvestigationPoolComponent,
        EarningsAssessorPoolComponent,
        CaptureEarningsComponent,
        VariableEarningsComponent,
        NonVariableEarningsComponent,
        OtherEarningTypeModal,
        ExitReasonDialogComponent,
        ProcessStpMessagesComponent,
        ClaimBeneficiaryComponent,
        WorkPoolContainerComponent,
        WorkPoolFilterComponent,
        EmployerWorkPoolComponent,
        MonthlyscheduleWorkPoolUserComponent,
        CoidWorkPoolMoreInforDialogComponent,
        ClaimsPaymentRecallComponent,
        MonthlyScheduledWorkPoolUserViewComponent,
        CloseAccidentClaimComponent,
        GatherDocumentsStepComponent,
        ReOpenReasonDialogComponent,
        ClaimMedicalAdvisorCoid,
        ClaimEarningsValidation,
        ClaimAbove30percentpdSCA,
        ClaimPensionPMCA,
        ClaimSection51,
        ClaimScaValidate,
        ClaimCcaValidate,
        ClaimPaymentReversalComponent,
        CADRequestInvoicePayment,
        TTDNearing18Months,
        MedicalReportMismatch,
        InvoicePaySCA,
        CaptureEarnings,
        ClaimDisabilityAssessmentApproval,
        ClaimInvestigationCoidComponent,
        Section40InvestigationComponent,
        LiabilityDecisionDialogComponent,
        ClaimComplianceComponent,
        UploadFinalMedicalReportCCA,
        ReviewInjuryIcd10CodeComponent,
        MmiExpiryExtensionComponent,
        DisabilityToFatalAssessComponent,
        CaptureEarningsSection51,
        ClaimLiabilityApprovalComponent,
        UploadSection90ReviewReportComponent,
        PaymentAuthorisationRequest
    ],
    exports: [],
    entryComponents: [
        AdditionalRegistryDetailsComponent,
        AllocateClaimUserComponent,
        ManageClaimUserComponent,
        ReAllocateClaimUserComponent,
        ManageClaimUserShowClaimsComponent,
        ClaimsDocumentsComponent,
        EventComponent,
        PersonEventComponent,
        EventNotesComponent,
        EventSummaryComponent,
        ClaimBankAccountComponent,
        ClaimantComponent,
        ClaimViewComponent,
        NewMemberApprovalComponent,
        NewMemberClaimantComponent,
        RejectionNotificationComponent,
        ClaimNotificationAuditComponent,
        ClaimSmsAuditComponent,
        ClaimsPolicyDetailComponent,
        ClaimantRecoveryReasonComponent,
        ClaimantRecoveryDocumentComponent,
        ClaimantRecoveryBeneficiaryComponent,
        ClaimTracerComponent,
        ClaimantRecoveryBeneficiaryComponent,
        ClaimInvestigationDocumentComponent,
        ClaimInvestigationNoteComponent,
        TracerListComponent,
        TraceDetailsComponent,
        TraceDocumentComponent,
        TraceInvoiceComponent,
        ClaimInvestigationClaimsDocumentComponent,
        RolePlayerDialogBankingDetailsComponent,
        ClaimDiseaseDetailsComponent,
        ClaimInsuranceDetailsComponent,
        ClaimClaimantDetailsComponent,
        ClaimIncidentDetailsComponent,
        ClaimIncidentDetailsWizardComponent,
        ClaimClaimantDetailsWizardComponent,
        ClaimInsuranceDetailsWizardComponent,
        ClaimAccidentDocumentWizardComponent,
        ClaimDiseaseDetailsWizardComponent,
        ClaimNotificationDocumentsComponent,
        ClaimMedicalReportDetailsComponent,
        PersonEventEmailAuditComponent,
        PersonEventSmsAuditComponent,
        RolePlayerDialogRegistrationNumberComponent,
        PopupIcd10AdditionalComponent,
        CadPoolComponent,
        EmployeeQuestionnaireComponent,
        PopupQuestionnaireDeleteComponent,
        CoidDashboardComponent,
        VopdOverviewComponent,
        StmOverviewComponent,
        CoidTableDashboardComponent,
        ClaimClaimantAddressWizardComponent,
        ExitReasonDashboardComponent,
        ExitReasonDescriptionComponent,
        RemoveFromStpComponent,
        ClaimAuditViewComponent,
        CmcPoolComponent,
        InvestigationPoolComponent,
        EarningsAssessorPoolComponent,
        CaptureEarningsComponent,
        VariableEarningsComponent,
        NonVariableEarningsComponent,
        OtherEarningTypeModal,
        ClaimBeneficiaryComponent,
        EmployerWorkPoolComponent,
        ClaimsPaymentRecallComponent,
    ],
    providers: [
        RolePlayerService,
        SharedServicesLibModule,
        DatePipe,
        PolicyService,
        InsuredLifeService,
        BankBranchService,
        SearchEventDataSource,
        BrokerageService,
        BreadcrumbPolicyService,
        CadPoolDataSource,
        CmcPoolDataSource,
        BeneficiaryService
    ],
    bootstrap: []
})
export class ClaimManagerModule {
    constructor(componentFactoryResolver: ComponentFactoryResolver, contextFactory: WizardContextFactory, private injector: Injector) {
        // register the context factories used in the wizard controls
        contextFactory.addWizardContext(new RegisterFuneralWizard(componentFactoryResolver), 'register-funeral-claim');
        contextFactory.addWizardContext(new EventWizard(componentFactoryResolver), 'manage-event');
        contextFactory.addWizardContext(new MemberApprovalWizard(componentFactoryResolver), 'role-player');
        contextFactory.addWizardContext(new ClaimBeneficiaryBankingWizard(componentFactoryResolver), 'create-beneficiary');
        contextFactory.addWizardContext(new CreateBankingDetailsWizard(componentFactoryResolver), 'create-banking-details');
        contextFactory.addWizardContext(new UpdateBankingDetailsWizard(componentFactoryResolver), 'update-banking-details');
        contextFactory.addWizardContext(new RejectionNotificationWizard(componentFactoryResolver), 'claims-rejection-notification');
        contextFactory.addWizardContext(new ClaimantRecoveryWizard(componentFactoryResolver), 'claimant-recovery-approval');
        contextFactory.addWizardContext(new FuneralTracingWizard(componentFactoryResolver), 'funeral-tracing');
        contextFactory.addWizardContext(new ClaimInvestigationWizard(componentFactoryResolver), 'claims-investigation');
        contextFactory.addWizardContext(new TraceDocumentWizard(componentFactoryResolver), 'trace-document');
        contextFactory.addWizardContext(new ClaimAccidentWizard(componentFactoryResolver, this.injector.get(AuthService)), 'accident-claim');
        contextFactory.addWizardContext(new ClaimDiseaseWizard(componentFactoryResolver, this.injector.get(AuthService)), 'disease-claim');
        contextFactory.addWizardContext(new AccidentDiseaseNotificationWizard(componentFactoryResolver), 'capture-claim-notification');
        contextFactory.addWizardContext(new DiseaseIncidentNotificationWizard(componentFactoryResolver), 'disease-incident-notification');
        contextFactory.addWizardContext(new CmcVopdNotificationWizard(componentFactoryResolver), 'CMC-VOPD-notification');
        contextFactory.addWizardContext(new Section40NotificationWizard(componentFactoryResolver), 'Section-40-notification');
        contextFactory.addWizardContext(new CadDocumentRequestWizard(componentFactoryResolver), 'cad-document-request-wizard');
        contextFactory.addWizardContext(new ClaimInvestigationCoidWizard(componentFactoryResolver), 'claim-investigation-coid');
        contextFactory.addWizardContext(new ClaimMedicalAdvisorCoidWizard(componentFactoryResolver), 'claim-medical-advisor-coid');
        contextFactory.addWizardContext(new ClaimEarningsValidationWizard(componentFactoryResolver), 'claim-earnings-validate');
        contextFactory.addWizardContext(new ClaimAbove30percentpdSCAWizard(componentFactoryResolver), 'claim-above30percentpd-sca');
        contextFactory.addWizardContext(new ClaimPensionPMCAWizard(componentFactoryResolver), 'claim-pension-pmca');
        contextFactory.addWizardContext(new ClaimSection51Wizard(componentFactoryResolver), 'claim-section51');
        contextFactory.addWizardContext(new ClaimScaValidateWizard(componentFactoryResolver), 'claim-sca-validate');
        contextFactory.addWizardContext(new ClaimCcaValidateWizard(componentFactoryResolver), 'claim-cca-validate');
        contextFactory.addWizardContext(new ClaimPaymentReversalWizard(componentFactoryResolver), 'claim-payment-reversal');
        contextFactory.addWizardContext(new CADRequestInvoicePaymentWizard(componentFactoryResolver), 'cad-request-invoice-payment');
        contextFactory.addWizardContext(new TTDNearing18MonthsWizard(componentFactoryResolver), 'ttd-nearing-18months');
        contextFactory.addWizardContext(new MedicalReportMismatchWizard(componentFactoryResolver), '1st-medical-report-mismatch');
        contextFactory.addWizardContext(new InvoicePaySCAWizard(componentFactoryResolver), 'invoice-payment-approval');
        contextFactory.addWizardContext(new CaptureEarningsWizard(componentFactoryResolver), 'capture-earnings');
        contextFactory.addWizardContext(new ClaimDisabilityAssessmentApprovalWizard(componentFactoryResolver), 'disability-assessment-approval');
        contextFactory.addWizardContext(new ClaimComplianceWizard(componentFactoryResolver), 'claim-compliance');
        contextFactory.addWizardContext(new UploadFinalMedicalReportCCAWizard(componentFactoryResolver), 'upload-final-medical-report-workflow-cca');
        contextFactory.addWizardContext(new ReviewInjuryIcd10CodeWizard(componentFactoryResolver), 'review-injury-icd10-codes');
        contextFactory.addWizardContext(new MmiExpiryExtensionWizard(componentFactoryResolver), 'mmi-expiry-extension');
        contextFactory.addWizardContext(new CaptureEarningsOverrideWizard(componentFactoryResolver), 'capture-earnings-override');
        contextFactory.addWizardContext(new DisabilityToFatalWizard(componentFactoryResolver), 'disability-to-fatal');
        contextFactory.addWizardContext(new CaptureEarningsSection51Wizard(componentFactoryResolver), 'capture-earnings-section-51');
        contextFactory.addWizardContext(new ClaimLiabilityApprovalWizard(componentFactoryResolver), 'claim-liability-approval');
        contextFactory.addWizardContext(new UploadSection90ReviewReportWizard(componentFactoryResolver), 'upload-section90-review-report');
        contextFactory.addWizardContext(new PaymentAuthorisationRequestWizard(componentFactoryResolver), 'payment-authorisation-request');
    }
}
