import { NgModule } from '@angular/core';
import { ClientCareSharedModule } from 'projects/clientcare/src/app/shared/clientcare.shared.module';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { SharedModelsLibModule } from 'projects/shared-models-lib/src/public-api';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/public-api';
import { SharedUtilitiesLibModule } from 'projects/shared-utilities-lib/src/public-api';
import { MatSortModule } from '@angular/material/sort';
import { ClaimRequirementsViewComponent } from './claim-requirements-view/claim-requirements-view.component';
import { BeneficiaryListComponent } from './claim-holistic-view/beneficiary-list/beneficiary-list.component';
import { HolisticClaimDetailsComponent } from './claim-holistic-view/holistic-claim-details/holistic-claim-details.component';
import { HolisticClaimViewComponent } from './claim-holistic-view/holistic-claim-view-start-point/holistic-claim-view.component';
import { HolisticBeneficiaryContainerComponent } from './claim-holistic-view/holistic-container-beneficiary/holistic-beneficiary-container/holistic-beneficiary-container.component';
import { HolisticBeneficiaryRelationComponent } from './claim-holistic-view/holistic-container-beneficiary/holistic-beneficiary-relation/holistic-beneficiary-relation.component';
import { HolisticFinalMedicalReportsComponent } from './claim-holistic-view/holistic-container-medical-reports/holistic-final-medical-reports/holistic-final-medical-reports.component';
import { HolisticFirstMedicalReportsComponent } from './claim-holistic-view/holistic-container-medical-reports/holistic-first-medical-reports/holistic-first-medical-reports.component';
import { HolisticMedicalReportContainerComponent } from './claim-holistic-view/holistic-container-medical-reports/holistic-medical-report-container/holistic-medical-report-container.component';
import { HolisticProgressMedicalReportsComponent } from './claim-holistic-view/holistic-container-medical-reports/holistic-progress-medical-reports/holistic-progress-medical-reports.component';
import { HolisticEmploymentDetailsComponent } from './claim-holistic-view/holistic-employment-details/holistic-employment-details.component';
import { HolisticEventComponent } from './claim-holistic-view/holistic-event/holistic-event.component';
import { HolisticInjuryDetailsComponent } from './claim-holistic-view/holistic-injury-details/holistic-injury-details.component';
import { HolisticMedicalInvoicesComponent } from './claim-holistic-view/holistic-medical-invoices/holistic-medical-invoices.component';
import { HolisticPersonDetailsComponent } from './claim-holistic-view/holistic-person-details/holistic-person-details.component';
import { HolisticPersonEventListComponent } from './claim-holistic-view/holistic-person-event-list/holistic-person-event-list.component';
import { ManageEventDetailsComponent } from './claim-holistic-view/manage-event-details/manage-event-details.component';
import { ListEarningsComponent } from './list-earnings/list-earnings.component';
import { GroupByEarningTypePipe } from './list-earnings/group-by-earningtype.pipe';
import { ClaimAccidentDocumentComponent } from './claim-accident-document/claim-accident-document.component';
import { BeneficiaryService } from 'projects/clientcare/src/app/policy-manager/shared/Services/beneficiary.service';
import { HolisticQuestionnaireComponent } from './claim-holistic-view/holistic-questionnaire/holistic-questionnaire.component';
import { EmployeeListComponent } from './claim-holistic-view/employee-list/employee-list.component';
import { EmployeeContainerComponent } from './claim-holistic-view/employee-container/employee-container.component';
import { AccidentInjuryDetailsComponent } from './claim-holistic-view/accident-injury-details/accident-injury-details.component';
import { HolisticAccidentDetailsComponent } from './claim-holistic-view/holistic-injury-details/holistic-accident-details/holistic-accident-details.component';
import { HolisticDiseaseDetailsComponent } from './claim-holistic-view/holistic-injury-details/holistic-disease-details/holistic-disease-details.component';
import { HolisticDeathDetailsComponent } from './claim-holistic-view/holistic-injury-details/holistic-death-details/holistic-death-details.component';
import { HolisticRoadAccidentDetailsComponent } from './claim-holistic-view/holistic-injury-details/holistic-road-accident-details/holistic-road-accident-details.component';
import { HolisticAccidentChecksComponent } from './claim-holistic-view/holistic-injury-details/holistic-accident-checks/holistic-accident-checks.component';
import { HolisticIcdListComponent } from './claim-holistic-view/holistic-injury-details/holistic-icd-list/holistic-icd-list.component';
import { HolistVopdDialogComponent } from './claim-holistic-view/holistic-vopd-icon/holist-vopd-dialog/holist-vopd-dialog.component';
import { HolisticVopdIconComponent } from './claim-holistic-view/holistic-vopd-icon/holistic-vopd-icon.component';
import { RequestAdditionalDocumentsComponent } from './claim-holistic-view/request-additional-documents/request-additional-documents.component';
import { HolisticClaimNoteComponent } from './claim-holistic-view/holistic-claim-note/holistic-claim-note.component';
import { PersonEventSearchComponent } from './person-event-search/person-event-search.component';
import { EventSearchComponent } from './event-search/event-search.component';
import { AllocatePoolItemComponent } from './allocate-pool-item/allocate-pool-item.component';
import { MessageFloatComponent } from './message-float/message-float.component';
import { MessageFloatDialogComponent } from './message-float/message-float-dialog/message-float-dialog.component';
import { AllocatePoolItemDialogComponent } from './allocate-pool-item/allocate-pool-item-dialog/allocate-pool-item-dialog.component';
import { ManagePoolUsersComponent } from './manage-pool-users/manage-pool-users.component';
import { UserPagedClaimsComponent } from './manage-pool-users/user-paged-claims/user-paged-claims.component';
import { HolisticPagedMedicalInvoiceComponent } from './claim-holistic-view/holistic-paged-medical-invoice/holistic-paged-medical-invoice.component';
import { FirstMedicalUploadComponent } from './medical-upload-icon/first-medical-upload/first-medical-upload.component';
import { MedicalUploadIconComponent } from './medical-upload-icon/medical-upload-icon.component';
import { MedicalUploadDialogComponent } from './medical-upload-icon/medical-upload-dialog/medical-upload-dialog.component';
import { DocumentWizardContainerComponent } from './claim-holistic-view/document-wizard-container/document-wizard-container.component';
import { ProgressMedicalUploadComponent } from './medical-upload-icon/progress-medical-upload/progress-medical-upload.component';
import { FinalMedicalUploadComponent } from './medical-upload-icon/final-medical-upload/final-medical-upload.component';
import { EstimateIcdCodeListComponent } from './medical-upload-icon/estimate-icd-code-list/estimate-icd-code-list.component';
import { ClaimPaymentReferralComponent } from './claim-payment-referral/claim-payment-referral.component';
import { ClaimPagedInvoiceComponent } from './claim-invoice-container/claim-paged-invoices/claim-paged-invoice.component';
import { ClaimBenefitTypeContainerComponent } from './claim-holistic-view/claim-benefit-type-container/claim-benefit-type-container.component';
import { ClaimInvoiceContainerComponent } from './claim-invoice-container/claim-invoice-container.component';
import { ClaimInvoiceFilterComponent } from './claim-invoice-container/claim-invoice-filter/claim-invoice-filter.component';
import { ClaimInvoiceDialogComponent } from './claim-invoice-container/claim-invoice-dialog/claim-invoice-dialog.component';
import { ClaimPaymentContainerComponent } from './claim-payment-container/claim-payment-container.component';
import { ClaimInvoiceService } from '../../services/claim-invoice.service';
import { ClaimPagedPaymentComponent } from './claim-payment-container/claim-paged-payment/claim-paged-payment.component';
import { InvoiceWidowLumpSumComponent } from './claim-invoice-container/invoice-widow-lump-sum/invoice-widow-lump-sum.component';
import { InvoiceTravelExpenseComponent } from './claim-invoice-container/invoice-travel-expense/invoice-travel-expense.component';
import { InvoiceSundryComponent } from './claim-invoice-container/invoice-sundry/invoice-sundry.component';
import { InvoiceTebaComponent } from './claim-invoice-container/invoice-teba/invoice-teba.component';
import { InvoicePartialDependencyLumpSumComponent } from './claim-invoice-container/invoice-partial-dependency-lump-sum/invoice-partial-dependency-lump-sum.component';
import { ClaimPaymentFilterComponent } from './claim-payment-container/claim-payment-filter/claim-payment-filter.component';
import { InvoiceFuneralExpensesComponent } from './claim-invoice-container/invoice-funeral-expenses/invoice-funeral-expenses.component';
import { InvoiceGenericComponent } from './claim-invoice-container/invoice-generic/invoice-generic.component';
import { ClaimEstimatesContainerComponent } from './claim-estimates-container/claim-estimates-container.component';
import { ClaimPagedEstimatesComponent } from './claim-estimates-container/claim-paged-estimates/claim-paged-estimates.component';
import { ClaimEstimateFilterComponent } from './claim-estimates-container/claim-estimate-filter/claim-estimate-filter.component';
import { ClaimReferralComponent } from './claim-referral/claim-referral.component';
import { TotalTemporaryDisabilityComponent } from './claim-invoice-container/total-temporary-disability/total-temporary-disability.component';
import { PayeeTypeSearchComponent } from './payee-type-search/payee-type-search.component';
import { ClaimEstimateCaptureDialogComponent } from './claim-estimates-container/claim-estimate-capture-dialog/claim-estimate-capture-dialog.component';
import { ClaimDisabilityAssessmentComponent } from './claim-disability-container/claim-disability-assessment/claim-disability-assessment.component';
import { ClaimDisabilityFilterComponent } from './claim-disability-container/claim-disability-filter/claim-disability-filter.component';
import { ClaimDisabilityContainerComponent } from './claim-disability-container/claim-disability-container.component';
import { ClaimDisabilityDialogComponent } from './claim-disability-container/claim-disability-dialog/claim-disability-dialog.component';
import { ClaimAuthorisationsContainerComponent } from './claim-authorisations-container/claim-authorisations-container.component';
import { ClaimAuthorisationsFilterComponent } from './claim-authorisations-container/claim-authorisations-filter/claim-authorisations-filter.component';
import { ClaimAuthorisationsDialogComponent } from './claim-authorisations-container/claim-authorisations-dialog/claim-authorisations-dialog.component';
import { ClaimTravelAuthorisationsComponent } from './claim-authorisations-container/claim-travel-authorisations/claim-travel-authorisations.component';
import { HolisticClaimEstimatesComponent } from './claim-holistic-view/holistic-claim-estimates/holistic-claim-estimates.component';
import { SelectClaimBenefitComponent } from './claim-holistic-view/holistic-claim-estimates/select-claim-benefit/select-claim-benefit.component';
import { ClaimHearingAssessmentComponent } from './claim-disability-container/claim-hearing-assessment/claim-hearing-assessment.component';
import { ClaimPagedDisabilityComponent } from './claim-disability-container/claim-paged-disability/claim-paged-disability.component';
import { ClaimWorkflowNotificationComponent } from './claim-holistic-view/claim-workflow-notification/claim-workflow-notification.component';
import { ClaimDisabilityLinkedReportComponent } from './claim-disability-container/claim-disability-assessment/claim-disability-linked-report/claim-disability-linked-report.component';
import { ClaimPagedTravelAuthorisationComponent } from './claim-authorisations-container/claim-paged-travel-authorisation/claim-paged-travel-authorisation.component';
import { CaptureNotesDialogComponent } from './claim-invoice-container/capture-notes-dialog/capture-notes-dialog.component';
import { ClaimPdlumpsumAwardComponent } from './claim-disability-container/claim-pdlumpsum-award/claim-pdlumpsum-award.component';
import { ClaimAcknowledgeViewComponent } from './claim-acknowledge-view/claim-acknowledge-view.component';
import { ClaimEstimatesMoreInfoComponent } from './claim-holistic-view/holistic-claim-estimates/claim-estimates-more-info/claim-estimates-more-info.component';
import { RecommendCaaDialogComponent } from './claim-holistic-view/holistic-claim-estimates/recommend-caa-dialog/recommend-caa-dialog.component';
import { AdditionalDocumentsComponent } from './additional-documents/additional-documents.component';
import { ClaimNotificationDialogComponent } from './claim-holistic-view/claim-workflow-notification/claim-notification-dialog/claim-notification-dialog.component';
import { ClaimWorkflowPagedReminderComponent } from './claim-holistic-view/claim-workflow-notification/claim-workflow-paged-reminder/claim-workflow-paged-reminder.component';
import { AssignCcaDialogComponent } from './claim-requirements-view/assign-cca-dialog/assign-cca-dialog.component';
import { ClaimPdAwardCalculationComponent } from './claim-disability-container/claim-pdlumpsum-award/claim-pd-award-calculation/claim-pd-award-calculation.component';
import { PdAwardPaymentComponent } from './claim-disability-container/claim-pdlumpsum-award/pd-award-payment/pd-award-payment.component';
import { NotRepuadiateClaimPopUpNoteComponent } from './claim-requirements-view/not-repuadiate-claim-pop-up-note/not-repuadiate-claim-pop-up-note.component';
import { HolisticInjuryDetailsViewComponent } from './claim-holistic-view/holistic-injury-details/holistic-injury-details-view/holistic-injury-details-view.component';
import { ClaimPagedHearingComponent } from './claim-disability-container/claim-paged-hearing/claim-paged-hearing.component';
import { ClaimEmailReferralDialogComponent } from './claim-disability-container/claim-email-referral-dialog/claim-email-referral-dialog.component';
import { ClaimReferralViewDialogComponent } from './claim-holistic-view/claim-workflow-notification/claim-referral-view-dialog/claim-referral-view-dialog.component';
import { HolisticSickNoteMedicalReportsComponent } from './claim-holistic-view/holistic-container-medical-reports/holistic-sicknote-medical-reports/holistic-sicknote-medical-reports.component';
import { EstimateBasisViewComponent } from './claim-holistic-view/holistic-injury-details/estimate-basis-view/estimate-basis-view.component';
import { ReRankIcd10codesComponent } from './claim-holistic-view/holistic-injury-details/re-rank-icd10codes/re-rank-icd10codes.component';
import { DeleteFinalMedicalReportComponent } from './claim-holistic-view/holistic-container-medical-reports/delete-final-medical-report/delete-final-medical-report.component';
import { PersonEventProcessTrackerComponent } from './person-event-process-tracker/person-event-process-tracker.component';
import { BenefitService } from 'projects/clientcare/src/app/product-manager/services/benefit.service';
import { PersonEventViewComponent } from './person-event-view/person-event-view.component';
import { EstimatedOverrideDialogComponent } from './claim-holistic-view/holistic-claim-estimates/estimated-override-dialog/estimated-override-dialog.component';
import { ClaimInvoiceCaptureDialogComponent } from './claim-holistic-view/holistic-claim-estimates/claim-invoice-capture-dialog/claim-invoice-capture-dialog.component';
import { ClaimRequirementsV2Component } from './claim-requirements-v2/claim-requirements-v2.component';
import { ClaimRequirementCategorySearchComponent } from './claim-requirements-v2/claim-requirement-category-search/claim-requirement-category-search.component';
import { ClaimRequirementCategorySearchDialogComponent } from './claim-requirements-v2/claim-requirement-category-search-dialog/claim-requirement-category-search-dialog.component';
import { BeneficiaryBankAccountDialogComponent } from './claim-invoice-container/claim-paged-invoices/beneficiary-bank-account-dialog/beneficiary-bank-account-dialog.component';
import { InvoiceFatalLumpSumComponent } from './claim-invoice-container/invoice-fatal-lump-sum/invoice-fatal-lump-sum.component';
import { EstimatedManualCaptureDialogComponent } from './claim-holistic-view/holistic-claim-estimates/estimated-manual-capture-dialog/estimated-manual-capture-dialog.component';
import { HolisticClaimTemplateReportsComponent } from './claim-holistic-view/holistic-claim-template-reports/holistic-claim-template-reports.component';
import { SickNoteUploadComponent } from './medical-upload-icon/sick-note-upload/sick-note-upload.component';

@NgModule({
  imports: [
    SharedModelsLibModule,
    SharedComponentsLibModule,
    SharedServicesLibModule,
    SharedUtilitiesLibModule,
    ClientCareSharedModule,
    MatSortModule,
  ],
  declarations: [
    BeneficiaryListComponent,
    HolisticInjuryDetailsComponent,
    HolisticEventComponent,
    ManageEventDetailsComponent,
    HolisticPersonDetailsComponent,
    HolisticEmploymentDetailsComponent,
    HolisticClaimDetailsComponent,
    HolisticPersonEventListComponent,
    HolisticClaimViewComponent,
    HolisticBeneficiaryRelationComponent,
    HolisticBeneficiaryContainerComponent,
    HolisticMedicalInvoicesComponent,
    HolisticFirstMedicalReportsComponent,
    HolisticProgressMedicalReportsComponent,
    HolisticFinalMedicalReportsComponent,
    HolisticMedicalReportContainerComponent,
    ClaimRequirementsViewComponent,
    ListEarningsComponent,
    GroupByEarningTypePipe,
    ClaimAccidentDocumentComponent,
    HolisticQuestionnaireComponent,
    EmployeeListComponent,
    EmployeeContainerComponent,
    AccidentInjuryDetailsComponent,
    HolisticAccidentDetailsComponent,
    HolisticDiseaseDetailsComponent,
    HolisticDeathDetailsComponent,
    HolisticRoadAccidentDetailsComponent,
    HolisticAccidentChecksComponent,
    HolisticIcdListComponent,
    HolistVopdDialogComponent,
    HolisticVopdIconComponent,
    RequestAdditionalDocumentsComponent,
    HolisticClaimNoteComponent,
    PersonEventSearchComponent,
    EventSearchComponent,
    AllocatePoolItemComponent,
    MessageFloatComponent,
    MessageFloatDialogComponent,
    AllocatePoolItemDialogComponent,
    ManagePoolUsersComponent,
    UserPagedClaimsComponent,
    HolisticPagedMedicalInvoiceComponent,
    FirstMedicalUploadComponent,
    MedicalUploadIconComponent,
    MedicalUploadDialogComponent,
    DocumentWizardContainerComponent,
    ProgressMedicalUploadComponent,
    FinalMedicalUploadComponent,
    EstimateIcdCodeListComponent,
    ClaimPaymentReferralComponent,
    ClaimPagedInvoiceComponent,
    ClaimBenefitTypeContainerComponent,
    ClaimInvoiceContainerComponent,
    ClaimDisabilityContainerComponent,
    ClaimInvoiceFilterComponent,
    ClaimDisabilityFilterComponent,
    ClaimInvoiceDialogComponent,
    ClaimDisabilityDialogComponent,
    ClaimPaymentContainerComponent,
    ClaimPagedPaymentComponent,
    InvoiceWidowLumpSumComponent,
    InvoiceTravelExpenseComponent,
    InvoiceSundryComponent,
    InvoiceTebaComponent,
    InvoicePartialDependencyLumpSumComponent,
    ClaimPaymentFilterComponent,
    InvoiceFuneralExpensesComponent,
    InvoiceGenericComponent,
    ClaimEstimatesContainerComponent,
    ClaimPagedEstimatesComponent,
    ClaimEstimateFilterComponent,
    ClaimReferralComponent,
    TotalTemporaryDisabilityComponent,
    PayeeTypeSearchComponent,
    ClaimEstimateCaptureDialogComponent,
    ClaimDisabilityAssessmentComponent,
    ClaimHearingAssessmentComponent,
    ClaimAuthorisationsContainerComponent,
    ClaimAuthorisationsFilterComponent,
    ClaimAuthorisationsDialogComponent,
    ClaimTravelAuthorisationsComponent,
    HolisticClaimEstimatesComponent,
    SelectClaimBenefitComponent,
    ClaimPagedDisabilityComponent,
    ClaimWorkflowNotificationComponent,
    ClaimPagedTravelAuthorisationComponent,
    ClaimDisabilityLinkedReportComponent,
    CaptureNotesDialogComponent,
    ClaimPdlumpsumAwardComponent,
    ClaimEstimatesMoreInfoComponent,
    RecommendCaaDialogComponent,
    ClaimAcknowledgeViewComponent,
    AdditionalDocumentsComponent,
    ClaimNotificationDialogComponent,
    ClaimWorkflowPagedReminderComponent,
    AssignCcaDialogComponent,
    ClaimPdAwardCalculationComponent,
    PdAwardPaymentComponent,
    NotRepuadiateClaimPopUpNoteComponent,
    HolisticInjuryDetailsViewComponent,
    ClaimPagedHearingComponent,
    ClaimEmailReferralDialogComponent,
    ClaimReferralViewDialogComponent,
    HolisticSickNoteMedicalReportsComponent,
    EstimateBasisViewComponent,
    ReRankIcd10codesComponent,
    DeleteFinalMedicalReportComponent,
    PersonEventProcessTrackerComponent,
    PersonEventViewComponent,
    EstimatedOverrideDialogComponent,
    ClaimInvoiceCaptureDialogComponent,
    ClaimRequirementsV2Component,
    ClaimRequirementCategorySearchComponent,
    ClaimRequirementCategorySearchDialogComponent,
    BeneficiaryBankAccountDialogComponent,
    InvoiceFatalLumpSumComponent,
    EstimatedManualCaptureDialogComponent,
    HolisticClaimTemplateReportsComponent,
    SickNoteUploadComponent,
  ],
  entryComponents: [
    BeneficiaryListComponent,
    HolisticInjuryDetailsComponent,
    HolisticEventComponent,
    ManageEventDetailsComponent,
    HolisticPersonDetailsComponent,
    HolisticEmploymentDetailsComponent,
    HolisticClaimDetailsComponent,
    HolisticPersonEventListComponent,
    HolisticClaimViewComponent,
    HolisticBeneficiaryRelationComponent,
    HolisticBeneficiaryContainerComponent,
    HolisticMedicalInvoicesComponent,
    HolisticFirstMedicalReportsComponent,
    HolisticProgressMedicalReportsComponent,
    HolisticFinalMedicalReportsComponent,
    HolisticMedicalReportContainerComponent,
    ClaimRequirementsViewComponent,
    ListEarningsComponent,
    GroupByEarningTypePipe,
    ClaimAccidentDocumentComponent,
    HolisticQuestionnaireComponent,
    EmployeeListComponent,
    EmployeeContainerComponent,
    AccidentInjuryDetailsComponent,
    HolisticAccidentDetailsComponent,
    HolisticDiseaseDetailsComponent,
    HolisticDeathDetailsComponent,
    HolisticRoadAccidentDetailsComponent,
    HolisticAccidentChecksComponent,
    HolisticIcdListComponent,
    HolistVopdDialogComponent,
    HolisticClaimNoteComponent,
    PersonEventSearchComponent,
    EventSearchComponent,
    AllocatePoolItemComponent,
    MessageFloatComponent,
    MessageFloatDialogComponent,
    AllocatePoolItemDialogComponent,
    ManagePoolUsersComponent,
    UserPagedClaimsComponent,
    HolisticPagedMedicalInvoiceComponent,
    FirstMedicalUploadComponent,
    MedicalUploadIconComponent,
    MedicalUploadDialogComponent,
    DocumentWizardContainerComponent,
    ProgressMedicalUploadComponent,
    FinalMedicalUploadComponent,
    EstimateIcdCodeListComponent,
    ClaimPaymentReferralComponent,
    ClaimPagedInvoiceComponent,
    ClaimPagedPaymentComponent,
    InvoiceWidowLumpSumComponent,
    InvoiceTravelExpenseComponent,
    InvoiceSundryComponent,
    InvoiceTebaComponent,
    InvoicePartialDependencyLumpSumComponent,
    ClaimPaymentFilterComponent,
    InvoiceFuneralExpensesComponent,
    InvoiceGenericComponent,
    ClaimEstimatesContainerComponent,
    ClaimPagedEstimatesComponent,
    ClaimEstimateFilterComponent,
    ClaimPagedDisabilityComponent,
    ClaimDisabilityLinkedReportComponent,
    ClaimPagedTravelAuthorisationComponent,
    ClaimAcknowledgeViewComponent,
    ClaimNotificationDialogComponent,
    ClaimPagedHearingComponent,
    ClaimWorkflowNotificationComponent,
    EstimateBasisViewComponent,
    ReRankIcd10codesComponent,
    HolisticClaimTemplateReportsComponent,
    SickNoteUploadComponent,
  ],
  exports: [
    BeneficiaryListComponent,
    HolisticInjuryDetailsComponent,
    HolisticEventComponent,
    ManageEventDetailsComponent,
    HolisticPersonDetailsComponent,
    HolisticEmploymentDetailsComponent,
    HolisticClaimDetailsComponent,
    HolisticPersonEventListComponent,
    HolisticClaimViewComponent,
    HolisticBeneficiaryRelationComponent,
    HolisticBeneficiaryContainerComponent,
    HolisticMedicalInvoicesComponent,
    HolisticFirstMedicalReportsComponent,
    HolisticProgressMedicalReportsComponent,
    HolisticFinalMedicalReportsComponent,
    HolisticMedicalReportContainerComponent,
    ClaimRequirementsViewComponent,
    ListEarningsComponent,
    GroupByEarningTypePipe,
    ClaimAccidentDocumentComponent,
    HolisticQuestionnaireComponent,
    EmployeeListComponent,
    EmployeeContainerComponent,
    AccidentInjuryDetailsComponent,
    HolisticAccidentDetailsComponent,
    HolisticDiseaseDetailsComponent,
    HolisticDeathDetailsComponent,
    HolisticRoadAccidentDetailsComponent,
    HolisticAccidentChecksComponent,
    HolisticIcdListComponent,
    HolistVopdDialogComponent,
    HolisticClaimNoteComponent,
    PersonEventSearchComponent,
    EventSearchComponent,
    AllocatePoolItemComponent,
    MessageFloatComponent,
    MessageFloatDialogComponent,
    AllocatePoolItemDialogComponent,
    ManagePoolUsersComponent,
    UserPagedClaimsComponent,
    HolisticPagedMedicalInvoiceComponent,
    FirstMedicalUploadComponent,
    MedicalUploadIconComponent,
    MedicalUploadDialogComponent,
    DocumentWizardContainerComponent,
    ProgressMedicalUploadComponent,
    FinalMedicalUploadComponent,
    EstimateIcdCodeListComponent,
    ClaimPaymentReferralComponent,
    ClaimPagedInvoiceComponent,
    ClaimPagedPaymentComponent,
    InvoiceWidowLumpSumComponent,
    InvoiceTravelExpenseComponent,
    InvoiceSundryComponent,
    InvoiceTebaComponent,
    InvoicePartialDependencyLumpSumComponent,
    ClaimPaymentFilterComponent,
    InvoiceFuneralExpensesComponent,
    InvoiceGenericComponent,
    ClaimEstimatesContainerComponent,
    ClaimPagedEstimatesComponent,
    ClaimEstimateFilterComponent,
    ClaimPagedDisabilityComponent,
    ClaimDisabilityLinkedReportComponent,
    ClaimPagedTravelAuthorisationComponent,
    ClaimPagedHearingComponent,
    EstimateBasisViewComponent,
    ReRankIcd10codesComponent,
    PersonEventProcessTrackerComponent,
    PersonEventViewComponent,
    ClaimInvoiceCaptureDialogComponent,
    ClaimRequirementsV2Component,
    ClaimRequirementCategorySearchComponent,
    ClaimRequirementCategorySearchDialogComponent,
    BeneficiaryBankAccountDialogComponent, 
    HolisticClaimEstimatesComponent,
    ClaimDisabilityContainerComponent,
    ClaimInvoiceContainerComponent,
    ClaimPaymentContainerComponent,
    EstimatedManualCaptureDialogComponent,
    HolisticClaimTemplateReportsComponent,
    SickNoteUploadComponent,
  ]
  ,
  providers: [
    BeneficiaryService,
    ClaimInvoiceService,
    BenefitService
  ]
})
export class ClaimCareSharedModule { }
