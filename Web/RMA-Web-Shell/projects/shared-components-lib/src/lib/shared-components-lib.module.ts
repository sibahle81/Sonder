import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectComponent } from './multi-select/multi-select.component';
import { UploadControlComponent } from './upload-control/upload-control.component';
import { SharedUtilitiesLibModule } from 'projects/shared-utilities-lib/src/public-api';
import { AuditLogService } from './audit/audit-log.service';
import { AuditLogDatasource } from './audit/audit-log.datasource';
import { NotesService } from './notes/notes.service';
import { NotesDatasource } from './notes/notes.datasource';
import { DialogComponent } from './dialogs/dialog/dialog.component';
import { ConfirmationDialogComponent } from './confirm-message/confirm-message.component';
import { LoadingComponent } from './loading/loading.component';
import { RouterModule } from '@angular/router';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LastModifiedByComponent } from './last-modified-by/last-modified-by.component';
import { AuditLogComponent } from './audit/audit-log.component';
import { NotesComponent } from './notes/notes.component';
import { ErrorComponent } from 'src/app/views/error/error.component';
import { NotesDialogComponent } from './notes-dialog/notes-dialog.component';
import { ConfirmationDialogsService } from './confirm-message/confirm-message.service';
import { HttpClientModule } from '@angular/common/http';
import { DocumentManagementDataSource } from './document-management/document-management.datasource';
import { DocumentManagementService } from './document-management/document-management.service';
import { PopupUploadDocumentComponent } from './document-management/popup-upload-document/popup-upload-document.component';
import { BeneficiaryBankingDetailComponent } from './beneficiary-banking-detail/beneficiary-banking-detail.component';
import { BeneficiaryBankingDetailService } from './beneficiary-banking-detail/beneficiary-banking-detail.service';
import { ValidityChecksDatasource } from './validity-checks/validity-checks.datasource';
import { ValidityChecksService } from './validity-checks/validity-checks.service';
import { ValidityChecksComponent } from './validity-checks/validity-checks.component';
import { RepresentativeSearchComponent } from 'projects/clientcare/src/app/broker-manager/views/representative-search/representative-search.component';
import { RolePlayerBankingDetailComponent } from './role-player-banking-detail/role-player-banking-detail.component';
import { RolePlayerAddressDetailComponent } from './role-player-address-detail/role-player-address-detail.component';
import { PopupAdditionalRequirementComponent } from './document-management/popup-additional-requirement/popup-additional-requirement.component';
import { PopupOutstandingDocumentsComponent } from './document-management/popup-outstanding-documents/popup-outstanding-documents.component';
import { PopupDeleteDocumentComponent } from './document-management/popup-delete-document/popup-delete-document.component';
import { AccountSearchComponent } from './account-search/account-search.component';
import { AccountSearchDataSource } from './account-search/account-search.datasource';
import { AccountService } from 'projects/fincare/src/app/shared/services/account.service';
import { PopupViewDocumentComponent } from './document-management/popup-view-document/popup-view-document.component';
import { EmailNotificationAuditComponentDataSource } from './email-notification-audit/email-notification-audit.datasource';
import { EmailNotificationAuditComponent } from './email-notification-audit/email-notification-audit.component';
import { EmailNotificationAuditService } from './email-notification-audit/email-notification-audit.service';
import { NotificationComponent } from './wizard/views/notification/notification.component';
import { ReportViewerWithDateAndPeriodFilterComponent } from './report-viewer-with-date-and-period-filter/report-viewer-with-date-and-period-filter.component';
import { PeriodService } from 'projects/admin/src/app/configuration-manager/shared/period.service';
import { ProductCrossRefTranTypeService } from 'projects/fincare/src/app/finance-manager/services/productCrossRefTranType.service';
import { SearchComponent } from './search/search.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ICD10CodeFilterDialogComponent } from './icd10-code-filter-dialog/icd10-code-filter-dialog.component';
import { MemberAccountHistoryComponent } from 'projects/fincare/src/app/billing-manager/views/member-account-history/member-account-history.component';
import { PopiaIdentityComponent } from './popia-compliant/popia-identity/popia-identity.component';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { PopupRejectDocumentsComponent } from './document-management/popup-reject-documents/popup-reject-documents.component';
import { FirstMedicalReportComponent } from './first-medical-report/first-medical-report.component';
import { Icd10CodeListViewComponent } from './icd10-code-list-view/icd10-code-list-view.component';
import { ProgressMedicalReportComponent } from './progress-medical-report/progress-medical-report.component';
import { FinalMedicalReportComponent } from './final-medical-report/final-medical-report.component';
import { UploadProgressReportDocumentComponent } from './document-management/upload-progress-report-document/upload-progress-report-document.component';
import { UploadFirstMedicalReportComponent } from './document-management/upload-first-medical-report/upload-first-medical-report.component';
import { SearchDebtorComponent } from './search-debtor/search-debtor.component';
import { ConcurrentPeriodComponent } from './concurrent-period/concurrent-period.component';
import { DocumentViewerComponent } from './document-management/document-viewer/document-viewer.component';
import { UploadFinalReportDocumentComponent } from './document-management/upload-final-report-document/upload-final-report-document.component';
import { RunningWizardsComponent } from './running-wizards/running-wizards.component';
import { WizardService } from './wizard/shared/services/wizard.service';
import { DocumentsComponent } from './documents/documents.component';
import { ProgressSpinnerComponent } from './progress-spinner/progress-spinner.component';
import { MedicalInvoicesListComponent } from './medical-invoices-list/medical-invoices-list.component';
import { ViewMedicalInvoicesComponent } from './view-medical-invoices/view-medical-invoices.component';
import { DocumentComponent } from './document/document-viewer/document.component';
import { DocumentSetDialogComponent } from './document/document-viewer/document-set-dialog/document-set-dialog.component';
import { DocumentUploaderComponent } from './document/document-uploader/document-uploader.component';
import { CompanySearchComponent } from './searches/company-search/company-search.component';
import { UserContextComponent } from './user-context/user-context/user-context.component';
import { UserContextDialogComponent } from './user-context/user-context-dialog/user-context-dialog.component';
import { UserContextViewComponent } from './user-context/user-context-view/user-context-view.component';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { RolePlayerAddressListComponent } from './roleplayer-address-list/role-player-address-list.component';
import { RolePlayerAddressDetailsComponent } from './roleplayer-address-list/role-player-address-details/role-player-address-details.component';
import { HealthcareProviderSearchComponent } from './healthcareprovider-search/healthcareprovider-search.component';
import { AccessDeniedComponent } from './secutity/access-denied/access-denied.component';
import { RolePlayerBankingListComponent } from './roleplayer-banking/role-player-banking-list/role-player-banking-list.component';
import { LeadService } from 'projects/clientcare/src/app/lead-manager/services/lead.service';
import { QuoteService } from 'projects/clientcare/src/app/quote-manager/services/quote.service';
import { PersonSearchComponent } from './searches/person-search/person-search.component';
import { SlaStatusChangeAuditComponent } from './sla/sla-status-change-audit/sla-status-change-audit.component';
import { SlaMovementAuditComponent } from './sla/sla-movement-audit/sla-movement-audit.component';
import { SLAService } from 'projects/shared-services-lib/src/lib/services/sla/sla.service';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { PagedSLAStatusChangeAuditsComponent } from './sla/sla-status-change-audit/paged-sla-status-change-audits/paged-sla-status-change-audits.component';
import { SLAStatusChangeAuditListDialogComponent } from './sla/sla-status-change-audit/sla-status-change-audit-list-dialog/sla-status-change-audit-list-dialog.component';
import { UserRemindersComponent } from './user-reminders-and-messages/user-reminders.component';
import { UserRemindersDialogComponent } from './user-reminders-and-messages/user-reminders-dialog/user-reminders-dialog.component';
import { PagedUserRemindersComponent } from './user-reminders-and-messages/paged-user-reminders/paged-user-reminders.component';
import { UserRemindersAlertDialogComponent } from './user-reminders-and-messages/user-reminders-alert-dialog/user-reminders-alert-dialog.component';
import { PoolWorkFlowService } from 'projects/shared-services-lib/src/lib/services/pool-work-flow/pool-work-flow.service';
import { UserSearchV2Component } from './searches/user-search-V2/user-search-V2.component';
import { ReportViewerModule } from './report-viewers/reportviewer.module';
import { ClientTypeFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/client-type-filter/client-type-filter.component';
import { DateRangeFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/date-range-filter/date-range-filter.component';
import { IndustryClassFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/industry-class-filter/industry-class-filter.component';
import { LeadSlaStatusFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/lead-sla-status-filter/lead-sla-status-filter.component';
import { PaymentStatusFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/payment-status-filter/payment-status-filter.component';
import { QuoteSlaStatusFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/quote-sla-status-filter/quote-sla-status-filter.component';
import { LeadSearchComponent } from './searches/lead-search/lead-search.component';
import { MemberSearchV2Component } from './searches/member-search/member-search-V2.component';
import { QuoteSearchV2Component } from './searches/quote-search/quote-search-V2.component';
import { PolicySearchV2Component } from './searches/policy-search/policy-search-V2.component';
import { PolicyMoreInformationDialogComponent } from './searches/policy-search/policy-more-information-dialog/policy-more-information-dialog.component';
import { PaymentTypeFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/payment-type-filter/payment-type-filter.component';
import { BranchFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/branch-filter/branch-filter.component';
import { ProductClassFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/product-class-filter/product-class-filter.component';
import { MonthFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/month-filter/month-filter.component';
import { ReversalReasonFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/reversal-reason-filter/reversal-reason-filter.component';
import { RepresentativeSearchV2Component } from './searches/representative-search-V2/representative-search-V2.component';
import { CitySearchComponent } from './searches/city-search/city-search.component';
import { PaymentSearchComponent } from './searches/payment-search/payment-search.component';
import { RolePlayerPolicyTransactionSearchComponent } from './searches/role-player-policy-transaction-search/role-player-policy-transaction-search.component';
import { PaymentListRecallComponent } from './payment-list-recall/payment-list-recall.component';
import { PaymentRecallNotesComponent } from './payment-recall-notes/payment-recall-notes.component';
import { PaymentReversalNotesComponent } from './payment-reversal-notes/payment-reversal-notes.component';
import { PolicyDocumentsComponent } from 'projects/clientcare/src/app/policy-manager/Views/policy-documents/policy-documents.component';
import { UserDisplayNameComponent } from './user-display-name/user-display-name.component';
import { ValidateLetterOfGoodStandingComponent } from './validate-letter-of-good-standing/validate-letter-of-good-standing.component';
import { ViewInvoiceStatusComponent } from './searches/role-player-policy-transaction-search/view-invoice-status/view-invoice-status.component';
import { PaymentListReversalComponent } from './payment-list-reversal/payment-list-reversal.component';
import { MessageFloatSharedComponent } from './shared-message-float/message-float-shared/message-float-shared.component';
import { SharedMessageFloatDialogComponent } from './shared-message-float/shared-message-float-dialog/shared-message-float-dialog.component';
import { BulkInvoiceReleaseComponent } from './searches/role-player-policy-transaction-search/bulk-invoice-release/bulk-invoice-release.component';
import { RoleplayerPolicyDeclarationComponent } from './declarations/roleplayer-policy-declaration/roleplayer-policy-declaration.component';
import { RenewalDeclarationComponent } from './declarations/renewals/renewal-declaration.component';
import { VarianceDialogComponent } from './declarations/renewals/variance-dialog/variance-dialog.component';
import { CloseRenewalPeriodComponent } from './member-declaration/close-renewal-period/close-renewal-period.component';
import { AssistanceRequestDialogComponent } from './declarations/renewals/assistance-request-dialog/assistance-request-dialog.component';
import { DefaultConfirmationDialogComponent } from './dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { RolePlayerPolicyDeclarationSearchComponent } from './searches/role-player-policy-declaration-search/role-player-policy-declaration-search.component';
import { RolePlayerPolicyDeclarationViewDialogComponent } from './searches/role-player-policy-declaration-search/role-player-policy-declaration-view-dialog/role-player-policy-declaration-view-dialog.component';
import { ProductFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/product-filter/product-filter.component';
import { DebtorSearchComponent } from './searches/debtor-search/debtor-search.component';
import { RolePlayerInvoiceSearchComponent } from './searches/role-player-invoice-search/role-player-invoice-search.component';
import { SsrsReportViewerDialogComponent } from './dialogs/ssrs-report-viewer-dialog/ssrs-report-viewer-dialog.component';
import { ReportViewedAuditSearchComponent } from './searches/report-viewed-audit-search/report-viewed-audit-search.component';
import { StagedClientRatesSearchComponent } from './staged-member-rates/staged-client-rates-search/staged-client-rates-search.component';
import { StagedMemberRatesComponent } from './staged-member-rates/staged-member-rates/staged-member-rates.component';
import { TermsArrangementApplicationComponent } from './terms-arrangement-application/terms-arrangement-application.component';
import { MemberComplianceDialogComponent } from './member-compliance/member-compliance-dialog/member-compliance-dialog.component';
import { MemberComplianceComponent } from './member-compliance/member-compliance/member-compliance.component';
import { HcpUserContextComponent } from './hcp-user-context/hcp-user-context/hcp-user-context.component';
import { HcpUserContextViewComponent } from './hcp-user-context/hcp-user-context-view/hcp-user-context-view.component';
import { HcpUserContextDialogComponent } from './hcp-user-context/hcp-user-context-dialog/hcp-user-context-dialog.component';
import { HcpUserContextDataSource } from './hcp-user-context/hcp-user-context/hcp-user-context.datasource';
import { PolicyNumberDisplayComponent } from './policy-number-display/policy-number-display.component';
import { RolePlayerBankingDetailsComponent } from './roleplayer-banking/role-player-banking-details/role-player-banking-details.component';
import { ProductSelectorV2Component } from './product-selector-V2/product-selector-V2.component';
import { QuoteViewV2Component } from './quote-view/quote-view.component';
import { AcceptQuoteDialogComponent } from './quote-view/accept-quote-dialog/accept-quote-dialog.component';
import { DeclineReasonDialogComponent } from './quote-view/decline-reason-dialog/decline-reason-dialog.component';
import { EmailDialogComponent } from './quote-view/email-dialog/email-dialog.component';
import { RolePlayerPolicyTransactionDetailDialogComponent } from './searches/role-player-policy-transaction-search/role-player-policy-transaction-detail-dialog/role-player-policy-transaction-detail-dialog.component';
import { LeadContactV2Component } from './lead-contact-V2/lead-contact-V2.component';
import { MedicalReportSearchComponent } from './searches/medical-report-search/medical-report-search.component';
import { RefundApplicationComponent } from './refund-application/refund-application.component';
import { RolePlayerPolicySelectorComponent } from './role-player-policy-selector/role-player-policy-selector.component';
import "src/app/shared/extensions/date.extensions";
import { TransactionsRefundComponent } from './refund-application/transactions-refund/transactions-refund.component';
import { DataMaskerComponent } from './data-masker/data-masker.component';
import { TermsProductsInitiationComponent } from './terms-products-initiation/terms-products-initiation.component';
import { LeadDisplayNameComponent } from './lead-display-name/lead-display-name.component';
import { TermSchedulesComponent } from './term-schedules/term-schedules.component';
import { DocumentUploaderDialogComponent } from './dialogs/document-uploader-dialog/document-uploader-dialog.component';
import { EmailAuditSearchComponent } from './searches/email-audit-search/email-audit-search.component';
import { HtmlViewerComponent } from './html-viewer/html-viewer.component';
import { EmailAuditDialogComponent } from './searches/email-audit-search/email-audit-dialog/email-audit-dialog.component';
import { ViewRecipientsDialogComponent } from './searches/email-audit-search/view-recipients-dialog/view-recipients-dialog.component';
import { TermsArrangementDebtorDetailsComponent } from './terms-arrangement-debtor-details/terms-arrangement-debtor-details.component';
import { TermsMoaComponent } from './terms-moa/terms-moa.component';
import { AutoApproveNotificationDialogComponent } from './auto-approve-notification-dialog/auto-approve-notification-dialog.component';
import { RolePlayerPolicyDeclarationHistoryViewComponent } from './declarations/role-player-policy-declaration-history-view/role-player-policy-declaration-history-view.component';
import { DynamicCollectionOptionSelectorDialogComponent } from './dialogs/dynamic-collection-option-selector-dialog/dynamic-collection-option-selector-dialog.component';
import { RemittanceReportsComponent } from './remittance-reports/remittance-reports.component';
import { RemittanceReportDialogComponent } from './dialogs/remittance-report-dialog/remittance-report-dialog.component';
import { HealthcareProviderSearchComponentV2 } from './searches/health-care-provider-search/health-care-provider-search.component';
import { ViewEmailAuditDialogComponent } from './dialogs/view-email-audit/view-email-audit.component';
import { MyWorkflowsSearchComponent } from './searches/my-workflow-search/my-workflows-search.component';
import { XlsxParserComponent } from './document/xlsx-parser/xlsx-parser.component';
import { UserSearchDialogComponent } from './dialogs/user-search-dialog/user-search-dialog.component';
import { HealthcareProviderSearchDialogComponent } from './dialogs/healthcare-provider-search-dialog/healthcare-provider-search-dialog.component';
import { RolePlayerSearchComponent } from './searches/role-player-search/role-player-search.component';
import { RolePlayerDisplayNameComponent } from './role-player-display-name/role-player-display-name.component';
import { YearFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/year-filter/year-filter.component';
import { RolePlayerPolicyOnlineSubmissionComponent } from './declarations/role-player-policy-online-submission/role-player-policy-online-submission.component';
import { PremiumPaybackListComponent } from './premium-payback-list/premium-payback-list.component';
import { MobileNumberDialogComponent } from './mobile-number-dialog/mobile-number-dialog.component';
import { BankingDetailsDialogComponent } from './banking-details-dialog/banking-details-dialog.component';
import { RolePlayerRelationSearchComponent } from './searches/role-player-relation-search/role-player-relation-search.component';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { MemberContactsComponent } from './member-contacts/member-contacts.component';
import { MemberContactDetailsComponent } from './member-contacts/member-contact-details/member-contact-details.component';
import { MemberContactDialogComponent } from './member-contacts/member-contact-dialog/member-contact-dialog.component';
import { TableComponent } from './table/table.component';
import { DataExchangeComponent } from './data-exchange/data-exchange/data-exchange.component';
import { MailAttachementViewerComponent } from './mail-attachement-viewer/mail-attachement-viewer.component';
import { MailAttachementViewerDialogComponent } from './mail-attachement-viewer/mail-attachment-viewer-dialog/mail-attachement-viewer-dialog.component';
import { Icd10SubCategorySearchComponent } from './searches/icd10-sub-category-search/icd10-sub-category-search.component';
import { SearchCriteriaFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/search-criteria-filter/search-criteria-filter.component';
import { DebtorPoliciesComponent } from './debtor-policies/debtor-policies.component';
import { CommonNotesComponent } from './common-notes/common-notes.component';
import { CommonNoteViewDialogComponent } from './common-notes/common-note-view-dialog/common-note-view-dialog.component';
import { PolicyPaymentsSearchComponent } from './searches/policy-payments-search/policy-payments-search.component';
import { PersonEventSearchV2Component } from './searches/person-event-search-V2/person-event-search-V2.component';
import { MspGroupFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/msp-group-filter/msp-group-filter.component';
import { Icd10CodeDescriptionComponent } from './icd10-code-description/icd10-code-description.component';
import { RemittanceMemberReportDialogComponent } from './dialogs/remittance-member-report-dialog/remittance-member-report-dialog.component';
import { PolicyPaymentListComponent } from './dialogs/policy-payment-list/policy-payment-list.component';
import { ClaimTypeFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/claim-type-filter/claim-type-filter.component';
import { ReferralDetailComponent } from './referrals/referral-detail/referral-detail.component';
import { ReferralViewComponent } from './referrals/referral-view/referral-view.component';
import { ReferralContextSearchDialogComponent } from './referrals/referral-detail/referral-context-search-dialog/referral-context-search-dialog.component';
import { PagedReferralSearchComponent } from './referrals/paged-referral-search/paged-referral-search.component';
import { ReferralFeedbackComponent } from './referrals/referral-feedback/referral-feedback.component';
import { ReferralPerformanceRatingComponent } from './referrals/referral-performance-rating/referral-performance-rating.component';
import { RoleSearchV2Component } from './searches/role-search-V2/role-search-V2.component';
import { RoleSearchDialogComponent } from './dialogs/role-search-dialog/role-search-dialog.component';
import { RoleDisplayNameComponent } from './role-display-name/role-display-name.component';
import { ReferralReportsComponent } from './referrals/referral-reports/referral-reports.component';
import { ReferralReportsDialogComponent } from './referrals/referral-view/referral-reports-dialog/referral-reports-dialog.component';
import { NoteDialogComponent } from './note-dialog/note-dialog.component';
import { CommunicationFailureReasonDialogComponent } from './dialogs/communication-failure-reason-dialog/communication-failure-reason-dialog.component';
import { ModuleTypeFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/module-type-filter/module-type-filter.component';
import { ReferralTypeFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/referral-type-filter/referral-type-filter.component';
import { ReferralItemTypeFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/referral-item-type-filter/referral-item-type-filter.component';
import { BrokerageViewComponent } from './brokerage-view/brokerage-view.component';
import { RepresentativeViewComponent } from './representative-view/representative-view.component';
import { ClaimSearchComponent } from './searches/claim-search/claim-search.component';
import { ReferralQuickViewDialogComponent } from './referrals/paged-referral-search/referral-quick-view-dialog/referral-quick-view-dialog.component';
import { PagedReferralNatureOfQuerySearchComponent } from './referrals/paged-referral-nature-of-query-search/paged-referral-nature-of-query-search.component';
import { ReferralNatureOfQuerySearchDialogComponent } from './referrals/paged-referral-nature-of-query-search/referral-nature-of-query-search-dialog/referral-nature-of-query-search-dialog.component';
import { SearchPensionCaseComponent } from './searches/search-pension-case/search-pension-case.component';
import { ReferralFeedbackDialogComponent } from './referrals/referral-feedback/referral-feedback-dialog/referral-feedback-dialog.component';
import { RolePlayerContactOptionsDialogComponent } from './searches/email-audit-search/role-player-contact-options-dialog/role-player-contact-options-dialog.component';
import { BeneficiarySearchV2Component } from './searches/beneficiary-search-V2/beneficiary-search-V2.component';
import { PensionerInterviewDetailsComponent } from './pensioner-interview/pensioner-interview-details/pensioner-interview-details.component';
import { BeneficiaryPersonDetailComponent } from './beneficiary/beneficiary-person-detail/beneficiary-person-detail.component';
import { BeneficiaryRelationComponent } from './beneficiary/beneficiary-relation/beneficiary-relation.component';
import { BeneficiaryPagedListComponent } from './beneficiary/beneficiary-paged-list/beneficiary-paged-list.component';
import { ComposeNewEmailDialogComponent } from './searches/email-audit-search/compose-new-email-dialog/compose-new-email-dialog.component';
import { CommunicationTypeManagerDialogComponent } from './member-contacts/communication-type-manager-dialog/communication-type-manager-dialog.component';
import { WizardRolesAssignmentDialogComponent } from './dialogs/wizard-roles-assignment-dialog/wizard-roles-assignment-dialog.component';
import { PremiumListingSearchComponent } from './searches/premium-listing-search/premium-listing-search.component';
import { ConsolidatedFuneralUploadComponent } from './consolidated-funeral-upload/consolidated-funeral-upload.component';
import { PagedAuthorityLimitConfigurationSearchComponent } from './authority-limits/paged-authority-limit-configuration-search/paged-authority-limit-configuration-search.component';
import { FinancialPeriodFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/financial-period-filter/financial-period-filter.component';
import { RefreshDocumentReasonComponent } from './dialogs/refresh-document-reason/refresh-document-reason.component';
import { RefundStatusFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/refund-status-filter/refund-status-filter.component';
import { TransactionTypeFilterComponent } from './report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/transaction-type-filter/transaction-type-filter.component';
import { SmsAuditComponent } from './sms-audit/sms-audit.component';
import { SmsAuditDialogComponent } from './sms-audit/sms-audit-dialog/sms-audit-dialog.component';
import { SmsAuditSearchComponent } from './sms-audit/sms-audit-search/sms-audit-search.component';
import { ComposeNewSmsDialogComponent } from './sms-audit/compose-new-sms-dialog/compose-new-sms-dialog.component';
import { SmsAuditDataSource } from './sms-audit/sms-audit.datasource';
import { SmsAuditService } from './sms-audit/sms-audit.service';
import { TransactionSearchComponent } from './searches/transaction-search/transaction-search.component';

import { WizardValidationDialog } from './dialogs/wizard-validation-dialog/wizard-validation-dialog.component';


@NgModule({
  entryComponents: [
    DialogComponent,
    NotesDialogComponent,
    ConfirmationDialogComponent,
    PopupUploadDocumentComponent,
    PopupUploadDocumentComponent,
    PopupAdditionalRequirementComponent,
    PopupOutstandingDocumentsComponent,
    PopupDeleteDocumentComponent,
    NotificationComponent,
    ReportViewerWithDateAndPeriodFilterComponent,
    SearchComponent,
    ICD10CodeFilterDialogComponent,
    PopiaIdentityComponent,
    ContactDetailsComponent,
    PopupRejectDocumentsComponent,
    FirstMedicalReportComponent,
    Icd10CodeListViewComponent,
    ProgressMedicalReportComponent,
    FinalMedicalReportComponent,
    UploadProgressReportDocumentComponent,
    UploadFirstMedicalReportComponent,
    DocumentViewerComponent,
    MedicalInvoicesListComponent,
    DocumentSetDialogComponent,
    CompanySearchComponent,
    PersonSearchComponent,
    UserContextComponent,
    UserContextViewComponent,
    LeadSearchComponent,
    QuoteSearchV2Component,
    SlaStatusChangeAuditComponent,
    SlaMovementAuditComponent,
    PagedSLAStatusChangeAuditsComponent,
    UserRemindersComponent,
    PagedUserRemindersComponent,
    UserSearchV2Component,
    MemberSearchV2Component,
    PolicySearchV2Component,
    ViewMedicalInvoicesComponent,
    RolePlayerPolicyTransactionSearchComponent,
    RolePlayerPolicyDeclarationSearchComponent,
    PaymentListRecallComponent,
    PaymentRecallNotesComponent,
    PolicyDocumentsComponent,
    PaymentReversalNotesComponent,
    PaymentListReversalComponent,
    HcpUserContextComponent,
    HcpUserContextViewComponent,
    MedicalReportSearchComponent,
    DataExchangeComponent,
    RolePlayerContactOptionsDialogComponent,
    SmsAuditComponent,
    SmsAuditDialogComponent,
    SmsAuditSearchComponent,
    ComposeNewSmsDialogComponent,
    WizardValidationDialog
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule,
    ReportViewerModule,
    MaterialsModule,
    SharedUtilitiesLibModule,
    MatDialogModule
  ],
  declarations: [
    AuditLogComponent,
    ConfirmationDialogComponent,
    DialogComponent,
    ErrorComponent,
    LastModifiedByComponent,
    LoadingComponent,
    MultiSelectComponent,
    NotesComponent,
    UploadControlComponent,
    NotesDialogComponent,
    PopupUploadDocumentComponent,
    BeneficiaryBankingDetailComponent,
    ValidityChecksComponent,
    RepresentativeSearchComponent,
    PopupAdditionalRequirementComponent,
    RolePlayerBankingDetailComponent,
    RolePlayerAddressDetailComponent,
    PopupOutstandingDocumentsComponent,
    PopupDeleteDocumentComponent,
    AccountSearchComponent,
    PopupViewDocumentComponent,
    EmailNotificationAuditComponent,
    NotificationComponent,
    ReportViewerWithDateAndPeriodFilterComponent,
    SearchComponent,
    ICD10CodeFilterDialogComponent,
    MemberAccountHistoryComponent,
    PopiaIdentityComponent,
    ContactDetailsComponent,
    PopupRejectDocumentsComponent,
    FirstMedicalReportComponent,
    Icd10CodeListViewComponent,
    ProgressMedicalReportComponent,
    FinalMedicalReportComponent,
    UploadProgressReportDocumentComponent,
    UploadFirstMedicalReportComponent,
    SearchDebtorComponent,
    ConcurrentPeriodComponent,
    DocumentViewerComponent,
    UploadFinalReportDocumentComponent,
    RunningWizardsComponent,
    DocumentsComponent,
    ProgressSpinnerComponent,
    MedicalInvoicesListComponent,
    ViewMedicalInvoicesComponent,
    DocumentComponent,
    DocumentSetDialogComponent,
    DocumentUploaderComponent,
    CompanySearchComponent,
    PersonSearchComponent,
    UserContextComponent,
    UserContextViewComponent,
    UserContextDialogComponent,
    RolePlayerAddressListComponent,
    RolePlayerAddressDetailsComponent,
    HealthcareProviderSearchComponent,
    AccessDeniedComponent,
    RolePlayerBankingListComponent,
    LeadSearchComponent,
    QuoteSearchV2Component,
    SlaStatusChangeAuditComponent,
    SlaMovementAuditComponent,
    PagedSLAStatusChangeAuditsComponent,
    SLAStatusChangeAuditListDialogComponent,
    UserRemindersComponent,
    UserRemindersDialogComponent,
    UserRemindersAlertDialogComponent,
    PagedUserRemindersComponent,
    UserSearchV2Component,
    ClientTypeFilterComponent,
    DateRangeFilterComponent,
    IndustryClassFilterComponent,
    LeadSlaStatusFilterComponent,
    PaymentStatusFilterComponent,
    QuoteSlaStatusFilterComponent,
    MemberSearchV2Component,
    PolicySearchV2Component,
    PolicyMoreInformationDialogComponent,
    PaymentTypeFilterComponent,
    BranchFilterComponent,
    ProductClassFilterComponent,
    MonthFilterComponent,
    ReversalReasonFilterComponent,
    RepresentativeSearchV2Component,
    CitySearchComponent,
    PaymentSearchComponent,
    RoleplayerPolicyDeclarationComponent,
    RenewalDeclarationComponent,
    RolePlayerPolicyTransactionSearchComponent,
    PaymentListRecallComponent,
    PaymentRecallNotesComponent,
    PaymentReversalNotesComponent,
    PolicyDocumentsComponent,
    UserDisplayNameComponent,
    ValidateLetterOfGoodStandingComponent,
    ViewInvoiceStatusComponent,
    PaymentListReversalComponent,
    MessageFloatSharedComponent,
    SharedMessageFloatDialogComponent,
    BulkInvoiceReleaseComponent,
    VarianceDialogComponent,
    CloseRenewalPeriodComponent,
    AssistanceRequestDialogComponent,
    DefaultConfirmationDialogComponent,
    RolePlayerPolicyDeclarationSearchComponent,
    RolePlayerPolicyDeclarationViewDialogComponent,
    RolePlayerPolicyTransactionDetailDialogComponent,
    ProductFilterComponent,
    DebtorSearchComponent,
    RolePlayerInvoiceSearchComponent,
    SsrsReportViewerDialogComponent,
    ReportViewedAuditSearchComponent,
    StagedClientRatesSearchComponent,
    StagedMemberRatesComponent,
    TermsArrangementApplicationComponent,
    MemberComplianceComponent,
    MemberComplianceDialogComponent,
    HcpUserContextComponent,
    HcpUserContextViewComponent,
    HcpUserContextDialogComponent,
    PolicyNumberDisplayComponent,
    RolePlayerBankingDetailsComponent,
    ProductSelectorV2Component,
    QuoteViewV2Component,
    AcceptQuoteDialogComponent,
    DeclineReasonDialogComponent,
    EmailDialogComponent,
    LeadContactV2Component,
    MedicalReportSearchComponent,
    RefundApplicationComponent,
    RolePlayerPolicySelectorComponent,
    TransactionsRefundComponent,
    DataMaskerComponent,
    LeadDisplayNameComponent,
    DataMaskerComponent,
    TransactionsRefundComponent,
    TermsProductsInitiationComponent,
    TermSchedulesComponent,
    DocumentUploaderDialogComponent,
    EmailAuditSearchComponent,
    HtmlViewerComponent,
    MailAttachementViewerComponent,
    MailAttachementViewerDialogComponent,
    EmailAuditDialogComponent,
    ViewRecipientsDialogComponent,
    TermsArrangementDebtorDetailsComponent,
    TermsMoaComponent,
    AutoApproveNotificationDialogComponent,
    RolePlayerPolicyDeclarationHistoryViewComponent,
    DynamicCollectionOptionSelectorDialogComponent,
    RemittanceReportsComponent,
    RemittanceReportDialogComponent,
    HealthcareProviderSearchComponentV2,
    ViewEmailAuditDialogComponent,
    MyWorkflowsSearchComponent,
    XlsxParserComponent,
    UserSearchDialogComponent,
    HealthcareProviderSearchDialogComponent,
    RolePlayerSearchComponent,
    RolePlayerDisplayNameComponent,
    YearFilterComponent,
    RolePlayerPolicyOnlineSubmissionComponent,
    PremiumPaybackListComponent,
    MobileNumberDialogComponent,
    BankingDetailsDialogComponent,
    RolePlayerRelationSearchComponent,
    MemberContactsComponent,
    MemberContactDetailsComponent,
    MemberContactDialogComponent,
    TableComponent,
    DataExchangeComponent,
    Icd10SubCategorySearchComponent,
    SearchCriteriaFilterComponent,
    Icd10SubCategorySearchComponent,
    DebtorPoliciesComponent,
    CommonNotesComponent,
    CommonNoteViewDialogComponent,
    PolicyPaymentsSearchComponent,
    PersonEventSearchV2Component,
    MspGroupFilterComponent,
    Icd10CodeDescriptionComponent,
    RemittanceMemberReportDialogComponent,
    PolicyPaymentListComponent,
    ClaimTypeFilterComponent,
    ReferralDetailComponent,
    ReferralViewComponent,
    ReferralContextSearchDialogComponent,
    PagedReferralSearchComponent,
    ReferralFeedbackComponent,
    ReferralPerformanceRatingComponent,
    RoleSearchV2Component,
    RoleSearchDialogComponent,
    RoleDisplayNameComponent,
    ReferralReportsComponent,
    ReferralReportsDialogComponent,
    NoteDialogComponent,
    CommunicationFailureReasonDialogComponent,
    ModuleTypeFilterComponent,
    ReferralTypeFilterComponent,
    ReferralItemTypeFilterComponent,
    BrokerageViewComponent,
    RepresentativeViewComponent,
    ClaimSearchComponent,
    ReferralQuickViewDialogComponent,
    PagedReferralNatureOfQuerySearchComponent,
    ReferralNatureOfQuerySearchDialogComponent,
    SearchPensionCaseComponent,
    ReferralFeedbackDialogComponent,
    RolePlayerContactOptionsDialogComponent,
    BeneficiarySearchV2Component,
    PensionerInterviewDetailsComponent,
    BeneficiaryPersonDetailComponent,
    BeneficiaryRelationComponent,
    BeneficiaryPagedListComponent,
    ComposeNewEmailDialogComponent,
    CommunicationTypeManagerDialogComponent,
    ComposeNewSmsDialogComponent,
    WizardRolesAssignmentDialogComponent,
    PremiumListingSearchComponent,
    ConsolidatedFuneralUploadComponent,
    PagedAuthorityLimitConfigurationSearchComponent,
    FinancialPeriodFilterComponent,
    RefreshDocumentReasonComponent,
    RefundStatusFilterComponent,
    SmsAuditComponent,
    SmsAuditDialogComponent,
    SmsAuditSearchComponent,
    ComposeNewSmsDialogComponent,
    WizardValidationDialog,
    TransactionSearchComponent,
    TransactionTypeFilterComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialsModule,
    // Other
    MultiSelectComponent,
    UploadControlComponent,
    ConfirmationDialogComponent,
    DialogComponent,
    LoadingComponent,
    LastModifiedByComponent,
    AuditLogComponent,
    NotesComponent,
    ErrorComponent,
    NotesDialogComponent,
    ReportViewerModule,
    PopupUploadDocumentComponent,
    PopupAdditionalRequirementComponent,
    PopupDeleteDocumentComponent,
    BeneficiaryBankingDetailComponent,
    RepresentativeSearchComponent,
    AccountSearchComponent,
    PopupViewDocumentComponent,
    RolePlayerBankingDetailComponent,
    RolePlayerAddressDetailComponent,
    EmailNotificationAuditComponent,
    NotificationComponent,
    ReportViewerWithDateAndPeriodFilterComponent,
    SearchComponent,
    MemberAccountHistoryComponent,
    PopiaIdentityComponent,
    ContactDetailsComponent,
    Icd10CodeListViewComponent,
    SearchDebtorComponent,
    ConcurrentPeriodComponent,
    DocumentViewerComponent,
    RunningWizardsComponent,
    DocumentsComponent,
    ProgressSpinnerComponent,
    DocumentComponent,
    DocumentUploaderComponent,
    CompanySearchComponent,
    PersonSearchComponent,
    UserContextComponent,
    UserContextViewComponent,
    RolePlayerAddressListComponent,
    RolePlayerAddressDetailsComponent,
    HealthcareProviderSearchComponent,
    AccessDeniedComponent,
    RolePlayerBankingListComponent,
    LeadSearchComponent,
    QuoteSearchV2Component,
    SlaStatusChangeAuditComponent,
    SlaMovementAuditComponent,
    PagedSLAStatusChangeAuditsComponent,
    SLAStatusChangeAuditListDialogComponent,
    UserRemindersComponent,
    UserRemindersDialogComponent,
    UserRemindersAlertDialogComponent,
    PagedUserRemindersComponent,
    UserSearchV2Component,
    ClientTypeFilterComponent,
    DateRangeFilterComponent,
    IndustryClassFilterComponent,
    LeadSlaStatusFilterComponent,
    PaymentStatusFilterComponent,
    QuoteSlaStatusFilterComponent,
    MemberSearchV2Component,
    PolicySearchV2Component,
    PolicyMoreInformationDialogComponent,
    PaymentTypeFilterComponent,
    BranchFilterComponent,
    ProductClassFilterComponent,
    MonthFilterComponent,
    ReversalReasonFilterComponent,
    RepresentativeSearchV2Component,
    CitySearchComponent,
    ViewMedicalInvoicesComponent,
    PaymentSearchComponent,
    RoleplayerPolicyDeclarationComponent,
    RenewalDeclarationComponent,
    RolePlayerPolicyTransactionSearchComponent,
    RolePlayerPolicyDeclarationSearchComponent,
    PaymentListRecallComponent,
    PaymentRecallNotesComponent,
    PaymentReversalNotesComponent,
    PolicyDocumentsComponent,
    UserDisplayNameComponent,
    ValidateLetterOfGoodStandingComponent,
    ViewInvoiceStatusComponent,
    PaymentListReversalComponent,
    MessageFloatSharedComponent,
    SharedMessageFloatDialogComponent,
    BulkInvoiceReleaseComponent,
    VarianceDialogComponent,
    CloseRenewalPeriodComponent,
    AssistanceRequestDialogComponent,
    DefaultConfirmationDialogComponent,
    RolePlayerPolicyDeclarationViewDialogComponent,
    ProductFilterComponent,
    DebtorSearchComponent,
    RolePlayerInvoiceSearchComponent,
    SsrsReportViewerDialogComponent,
    ReportViewedAuditSearchComponent,
    StagedClientRatesSearchComponent,
    StagedMemberRatesComponent,
    TermsArrangementApplicationComponent,
    MemberComplianceComponent,
    MemberComplianceDialogComponent,
    HcpUserContextComponent,
    HcpUserContextViewComponent,
    PolicyNumberDisplayComponent,
    RolePlayerBankingDetailsComponent,
    ProductSelectorV2Component,
    QuoteViewV2Component,
    AcceptQuoteDialogComponent,
    DeclineReasonDialogComponent,
    EmailDialogComponent,
    LeadContactV2Component,
    MedicalReportSearchComponent,
    RolePlayerPolicySelectorComponent,
    RefundApplicationComponent,
    TransactionsRefundComponent,
    DataMaskerComponent,
    LeadDisplayNameComponent,
    TermSchedulesComponent,
    DocumentUploaderDialogComponent,
    EmailAuditSearchComponent,
    HtmlViewerComponent,
    MailAttachementViewerComponent,
    MailAttachementViewerDialogComponent,
    EmailAuditDialogComponent,
    TermsArrangementDebtorDetailsComponent,
    AutoApproveNotificationDialogComponent,
    RolePlayerPolicyDeclarationHistoryViewComponent,
    DynamicCollectionOptionSelectorDialogComponent,
    RemittanceReportsComponent,
    RemittanceReportDialogComponent,
    HealthcareProviderSearchComponentV2,
    ViewEmailAuditDialogComponent,
    MyWorkflowsSearchComponent,
    XlsxParserComponent,
    UserSearchDialogComponent,
    HealthcareProviderSearchDialogComponent,
    RolePlayerSearchComponent,
    RolePlayerDisplayNameComponent,
    YearFilterComponent,
    RolePlayerPolicyOnlineSubmissionComponent,
    RolePlayerRelationSearchComponent,
    MemberContactsComponent,
    MemberContactDetailsComponent,
    MemberContactDialogComponent,
    TableComponent,
    DataExchangeComponent,
    Icd10SubCategorySearchComponent,
    DebtorPoliciesComponent,
    Icd10SubCategorySearchComponent,
    SearchCriteriaFilterComponent,
    CommonNotesComponent,
    CommonNoteViewDialogComponent,
    PersonEventSearchV2Component,
    MspGroupFilterComponent,
    Icd10CodeDescriptionComponent,
    ClaimTypeFilterComponent,
    ReferralDetailComponent,
    ReferralViewComponent,
    ReferralContextSearchDialogComponent,
    PagedReferralSearchComponent,
    ReferralFeedbackComponent,
    ReferralPerformanceRatingComponent,
    RoleSearchV2Component,
    RoleSearchDialogComponent,
    RoleDisplayNameComponent,
    ReferralReportsComponent,
    ReferralReportsDialogComponent,
    CommunicationFailureReasonDialogComponent,
    ModuleTypeFilterComponent,
    ReferralTypeFilterComponent,
    ReferralItemTypeFilterComponent,
    BrokerageViewComponent,
    RepresentativeViewComponent,
    ClaimSearchComponent,
    ReferralQuickViewDialogComponent,
    PagedReferralNatureOfQuerySearchComponent,
    ReferralNatureOfQuerySearchDialogComponent,
    SearchPensionCaseComponent,
    ReferralFeedbackDialogComponent,
    RolePlayerContactOptionsDialogComponent,
    BeneficiarySearchV2Component,
    PensionerInterviewDetailsComponent,
    BeneficiaryPersonDetailComponent,
    BeneficiaryRelationComponent,
    BeneficiaryPagedListComponent,
    ComposeNewEmailDialogComponent,
    CommunicationTypeManagerDialogComponent,
    ComposeNewSmsDialogComponent,
    PremiumListingSearchComponent,
    PagedAuthorityLimitConfigurationSearchComponent,
    FinancialPeriodFilterComponent,
    RefundStatusFilterComponent,
    SmsAuditComponent,
    SmsAuditDialogComponent,
    SmsAuditSearchComponent,
    ComposeNewSmsDialogComponent,
    TransactionSearchComponent,
    TransactionTypeFilterComponent
  ],
  providers: [
    AuditLogService,
    AuditLogDatasource,
    NotesService,
    NotesDatasource,
    ConfirmationDialogsService,
    DocumentManagementService,
    DocumentManagementDataSource,
    BeneficiaryBankingDetailService,
    ValidityChecksDatasource,
    ValidityChecksService,
    AccountSearchDataSource,
    AccountService,
    EmailNotificationAuditComponentDataSource,
    EmailNotificationAuditService,
    PeriodService,
    ProductCrossRefTranTypeService,
    PolicyService,
    WizardService,
    MemberService,
    LeadService,
    QuoteService,
    SLAService,
    UserReminderService,
    PoolWorkFlowService,
    HcpUserContextDataSource,
    RequiredDocumentService,
    SmsAuditDataSource,
    SmsAuditService
  ]
})
export class SharedComponentsLibModule { }
