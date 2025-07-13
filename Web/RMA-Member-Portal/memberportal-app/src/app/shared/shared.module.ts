import { CommonModule, DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { AngularMaterialsModule } from "../modules/angular-materials.module";
import { AuditLogComponent } from "./components/audit/audit-log.component";
import { BeneficiaryBankingDetailComponent } from "./components/beneficiary-banking-detail/beneficiary-banking-detail.component";
import { ConfirmationDialogComponent } from "./components/confirm-message/confirm-message.component";
import { DialogComponent } from "./components/dialog/dialog.component";
import { DocumentManagementService } from "./components/document-management/document-management.service";
import { PopupAdditionalRequirementComponent } from "./components/document-management/popup-additional-requirement/popup-additional-requirement.component";
import { PopupDeleteDocumentComponent } from "./components/document-management/popup-delete-document/popup-delete-document.component";
import { PopupOutstandingDocumentsComponent } from "./components/document-management/popup-outstanding-documents/popup-outstanding-documents.component";
import { PopupUploadDocumentComponent } from "./components/document-management/popup-upload-document/popup-upload-document.component";
import { PopupViewDocumentComponent } from "./components/document-management/popup-view-document/popup-view-document.component";
import { EmailAuditComponent } from "./components/email-audit/email-audit.component";
import { LastModifiedByComponent } from "./components/last-modified-by/last-modified-by.component";
import { MultiSelectComponent } from "./components/multi-select/multi-select.component";
import { NotesDialogComponent } from "./components/notes-dialog/notes-dialog.component";
import { NotesComponent } from "./components/notes/notes.component";
import { NotesService } from "./components/notes/notes.service";
import { NotificationSharedComponent } from "./components/notification/notification-shared.component";
import { ReportViewerModule } from "./components/report-viewer/reportviewer.module";
import { SearchAddressComponent } from "./components/search-address/search-address.component";
import { SearchComponent } from "./components/search/search.component";
import { SmsAuditComponent } from "./components/sms-audit/sms-audit.component";
import { UploadControlComponent } from "./components/upload-control/upload-control.component";
import { WizardBreadcrumbService } from "./components/wizard/shared/services/wizard-breadcumb.service";
import { WizardConfigurationService } from "./components/wizard/shared/services/wizard-configuration.service";
import { NotificationComponent } from "./components/wizard/views/notification/notification.component";
import { TaskListComponent } from "./components/wizard/views/task-list/task-list.component";
import { UploadWizardComponent } from "./components/wizard/views/upload-wizard/upload-wizard.component";
import { UserWizardListComponent } from "./components/wizard/views/user-wizard-list/user-wizard-list.component";
import { WizardApprovalStepComponent } from "./components/wizard/views/wizard-approval-step/wizard-approval-step.component";
import { WizardCancelStepComponent } from "./components/wizard/views/wizard-cancel-step/wizard-cancel-step.component";
import { WizardDetailsComponent } from "./components/wizard/views/wizard-details/wizard-details.component";
import { WizardHomeComponent } from "./components/wizard/views/wizard-home/wizard-home.component";
import { WizardHostComponent } from "./components/wizard/views/wizard-host/wizard-host.component";
import { WizardLastViewedListComponent } from "./components/wizard/views/wizard-last-viewed-list/wizard-last-viewed-list.component";
import { WizardListComponent } from "./components/wizard/views/wizard-list/wizard-list.component";
import { WizardMenuComponent } from "./components/wizard/views/wizard-menu/wizard-menu.component";
import { WizardRulesStepComponent } from "./components/wizard/views/wizard-rules-step/wizard-rules-step.component";
import { WizardSaveStepComponent } from "./components/wizard/views/wizard-save-step/wizard-save-step.component";
import { WizardSearchComponent } from "./components/wizard/views/wizard-search/wizard-search.component";
import { WizardStartStepComponent } from "./components/wizard/views/wizard-start-step/wizard-start-step.component";
import { WizardSubmitStepComponent } from "./components/wizard/views/wizard-submit-step/wizard-submit-step.component";
import { WizardValidationStepComponent } from "./components/wizard/views/wizard-validation-step/wizard-validation-step.component";
import { WizardRoutingModule } from "./components/wizard/wizard-routing.module";
import { AddressService } from "./services/address.service";
import { AlertService } from "./services/alert.service";
import { BankAccountService } from "./services/bank-account.service";
import { IntegrationService } from "./services/integrations.service";
import { LookupService } from "./services/lookup.service";
import { ProductOptionService } from "./services/product-option.service";
import { ProductService } from "./services/product.service";
import { RequiredDocumentService } from "./services/required-document.service";
import { RolePlayerService } from "./services/roleplayer.service";
import { UploadService } from "./services/upload-control.service";
import { UserIdleService } from "./services/user-idle/user-idle.service";
import { WizardService } from "./services/wizard.service";
import { RolePlayerAddressListComponent } from "./components/roleplayer-address-list/role-player-address-list.component";
import { RolePlayerAddressDetailsComponent } from "./components/roleplayer-address-list/role-player-address-details/role-player-address-details.component";
import { RolePlayerBankingListComponent } from "./components/roleplayer-banking/role-player-banking-list/role-player-banking-list.component";
import { MemberContactsComponent } from "./components/member-contacts/member-contacts.component";
import { MemberContactDetailsComponent } from "./components/member-contacts/member-contact-details/member-contact-details.component";
import { MemberContactDialogComponent } from "./components/member-contacts/member-contact-dialog/member-contact-dialog.component";
import { RolePlayerBankingDetailComponent } from "../broker/role-player-banking-detail/role-player-banking-detail.component";
import { GeneralAuditDialogComponent } from "./components/general-audits/general-audit-dialog/general-audit-dialog.component";
import { DefaultConfirmationDialogComponent } from "./components/dialog/dialogs/default-confirmation-dialog/default-confirmation-dialog.component";
import { DocumentUploaderComponent } from "./components/document/document-uploader/document-uploader.component";
import { DocumentComponent } from "./components/document/document-viewer/document.component";
import { DocumentSetDialogComponent } from "./components/document/document-viewer/document-set-dialog/document-set-dialog.component";

@NgModule({
  declarations: [
    UploadControlComponent,
    TaskListComponent,
    UploadWizardComponent,
    UserWizardListComponent,
    WizardApprovalStepComponent,
    WizardCancelStepComponent,
    WizardDetailsComponent,
    WizardHomeComponent,
    WizardHostComponent,
    WizardLastViewedListComponent,
    WizardListComponent,
    WizardMenuComponent,
    WizardRulesStepComponent,
    WizardSaveStepComponent,
    WizardSearchComponent,
    WizardStartStepComponent,
    WizardSubmitStepComponent,
    WizardValidationStepComponent,
    MultiSelectComponent,
    AuditLogComponent,
    DialogComponent,
    NotesComponent,
    LastModifiedByComponent,
    NotesDialogComponent,
    SearchComponent,
    NotificationSharedComponent,
    EmailAuditComponent,
    SmsAuditComponent,
    NotificationComponent,
    ConfirmationDialogComponent,
    SearchAddressComponent,
    PopupAdditionalRequirementComponent,
    PopupDeleteDocumentComponent,
    PopupOutstandingDocumentsComponent,
    PopupUploadDocumentComponent,
    PopupViewDocumentComponent,
    BeneficiaryBankingDetailComponent,
    RolePlayerAddressListComponent,
    RolePlayerAddressDetailsComponent,
    MemberContactsComponent,
    MemberContactDetailsComponent,
    MemberContactDialogComponent,
    DefaultConfirmationDialogComponent,
    RolePlayerBankingListComponent,
    GeneralAuditDialogComponent,
    DocumentComponent,
    DocumentSetDialogComponent,
    DocumentUploaderComponent,
  ],
  imports: [
    AngularMaterialsModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    WizardRoutingModule,
    ReportViewerModule
  ],
  providers: [
    LookupService,
    AlertService,
    NotesService,
    DocumentManagementService,
    UploadService,
    WizardBreadcrumbService,
    WizardConfigurationService,
    WizardService,
    RolePlayerService,
    DatePipe,
    UserIdleService,
    AddressService,
    IntegrationService,
    ProductOptionService,
    ProductService,
    RequiredDocumentService,
    BankAccountService

  ],
  exports: [
    PopupUploadDocumentComponent,
    PopupViewDocumentComponent,
    UploadControlComponent,
    TaskListComponent,
    UploadWizardComponent,
    UserWizardListComponent,
    WizardApprovalStepComponent,
    WizardCancelStepComponent,
    WizardDetailsComponent,
    WizardHomeComponent,
    WizardHostComponent,
    WizardLastViewedListComponent,
    WizardListComponent,
    WizardMenuComponent,
    WizardRulesStepComponent,
    WizardSaveStepComponent,
    WizardSearchComponent,
    WizardStartStepComponent,
    WizardSubmitStepComponent,
    WizardValidationStepComponent,
    MultiSelectComponent,
    AuditLogComponent,
    DialogComponent,
    TaskListComponent,
    NotesComponent,
    LastModifiedByComponent,
    NotesDialogComponent,
    SearchComponent,
    NotificationSharedComponent,
    ReportViewerModule,
    EmailAuditComponent,
    SmsAuditComponent,
    NotificationComponent,
    ConfirmationDialogComponent,
    SearchAddressComponent,
    BeneficiaryBankingDetailComponent,
    RolePlayerAddressListComponent,
    RolePlayerAddressDetailsComponent,
    MemberContactsComponent,
    MemberContactDetailsComponent,
    MemberContactDialogComponent,
    RolePlayerBankingListComponent,
    DefaultConfirmationDialogComponent,
    GeneralAuditDialogComponent,
    DocumentComponent,
    DocumentSetDialogComponent,
    DocumentUploaderComponent,
    AngularMaterialsModule
  ]
})
export class SharedModule { }
