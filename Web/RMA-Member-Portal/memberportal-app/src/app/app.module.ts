import { NavigationModule } from './navigation/navigation.module';
import { BrowserModule } from '@angular/platform-browser';
import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SigninRedirectCallbackComponent } from './home/signin-redirect-callback/signin-redirect-callback.component';
import { SignoutRedirectCallbackComponent } from './home/signout-redirect-callback/signout-redirect-callback.component';
import { LayoutComponent } from './layout/layout.component';
import { ToastrModule } from 'ng6-toastr-notifications';


// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
import { UserRegistrationComponent } from './member/user-registration/user-registration.component';
import { LookupService } from './shared/services/lookup.service';
import { UserService } from './core/services/user.service';
import { WizardContextFactory } from './shared/components/wizard/sdk/wizard-context.factory';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { SharedUtilitiesModule } from './shared-utilities/shared-utilities.module';
import { RulesEngineModule } from './shared/components/rules-engine/rules-engine.module';
import { CoreModule } from './core/core.module';
import { LinkExistingMemberWizard } from './member/wizard/link-existing-member-wizard';
import { AngularMaterialsModule } from './modules/angular-materials.module';
import { MemberActivationComponent } from './member/member-activation/member-activation.component';
import { NgxMaskModule } from 'ngx-mask';
import { UserRegistrationService } from './member/services/user-registration.service';
import { UserRegistrationDocumentsComponent } from './member/user-registration-documents/user-registration-documents.component';
import { UserRegistrationPopupUploadDocumentComponent } from './member/user-registration-documents/user-registration-popup-upload-document/user-registration-popup-upload-document.component';
import { UserRegistrationVopdFailedComponent } from './member/user-registration-vopd-failed/user-registration-vopd-failed.component';
import { PasswordStrengthComponent } from './member/password-strength/password-strength.component';
import { ForgotPasswordComponent } from './member/forgot-password/forgot-password.component';
import { PasswordResetComponent } from './member/password-reset/password-reset.component';
import { BrokerPolicyDocumentsComponent } from './broker/broker-policy-documents/broker-policy-documents.component';
import { BrokerPolicyListComponent } from './broker/broker-policy-list/broker-policy-list.component';
import { MemberPortalBrokerService } from './member/services/member-portal-broker-service';
import { BrokerPolicyDetailsComponent } from './broker/broker-policy-details/broker-policy-details.component';
import { BrokerPolicyService } from './broker/services/broker-policy-service';
import { BrokerPolicyEmailAuditComponent } from './broker/broker-policy-email-audit/broker-policy-email-audit.component';
import { BrokerPolicySmsAuditComponent } from './broker/broker-policy-sms-audit/broker-policy-sms-audit.component';
import { BrokerDisclaimerComponent } from './broker/broker-disclaimer/broker-disclaimer.component';
import { PolicyDetailsDocumentComponent } from './broker/policy-details-document/policy-details-document.component';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { MomentModule } from 'angular2-moment';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IdleComponent } from './idle/idle.component';
import { BrokerPremiumListingComponent } from './broker/broker-premium-listing/broker-premium-listing.component';
import { PremiumListingFileAuditComponent } from './broker/premium-listing-file-audit/premium-listing-file-audit.component';
import { BrokerExceptionReportComponent } from './broker/broker-exception-report/broker-exception-report.component';
import { PremiumListingRejectionNotificationWizard } from './broker/wizard/premium-listing-rejection-notification-wizard';

import { CaseListComponent } from './case/case-list/case-list.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { BeneficiaryListComponent } from './broker/beneficiary-list/beneficiary-list.component';
import { CancelPolicyReasonDialogComponent } from './broker/cancel-policy-reason-dialog/cancel-policy-reason-dialog.component';
import { ExtendedFamilyListComponent } from './broker/extended-family-list/extended-family-list.component';
import { GroupMemberDetailsComponent } from './broker/group-members-details/group-member-details.component';
import { GroupPolicyBenefitsComponent } from './broker/group-policy-benefits/group-policy-benefits.component';
import { MainMemberDetailsComponent } from './broker/main-member-details/main-member-details.component';
import { PersonDetailsComponent } from './broker/person-details/person-details.component';
import { PolicyAddressDetailsComponent } from './broker/policy-address-details/policy-address-details.component';
import { PolicyBankingDetailsComponent } from './broker/policy-banking-details/policy-banking-details.component';
import { PolicyBenefitsComponent } from './broker/policy-benefits/policy-benefits.component';
import { PolicyCollectionDetailsComponent } from './broker/policy-collection-details/policy-collection-details.component';
import { PolicyContactDetailsComponent } from './broker/policy-contact-details/policy-contact-details.component';
import { PolicyDocumentsComponent } from './broker/policy-documents/policy-documents.component';
import { PolicyListDialogComponent } from './broker/policy-list-dialog/policy-list-dialog.component';
import { PolicyProductOptionsComponent } from './broker/policy-product-options/policy-product-options.component';
import { PolicyScheduleComponent } from './broker/policy-schedule/policy-schedule.component';
import { PolicySummaryComponent } from './broker/policy-summary/policy-summary.component';
import { PreviousInsurerComponent } from './broker/previous-insurer/previous-insurer.component';
import { ReinstatePolicyDialogComponent } from './broker/reinstate-policy-dialog/reinstate-policy-dialog.component';
import { RemoveInsuredLifeNoteComponent } from './broker/remove-insured-life-note/remove-insured-life-note.component';
import { RolePlayerAddressDetailComponent } from './broker/role-player-address-detail/role-player-address-detail.component';
import { RolePlayerBankingDetailComponent } from './broker/role-player-banking-detail/role-player-banking-detail.component';
import { RolePlayerBenefitsChildComponent } from './broker/role-player-benefits-child/role-player-benefits-child.component';
import { RolePlayerBenefitsExtendedComponent } from './broker/role-player-benefits-extended/role-player-benefits-extended.component';
import { RolePlayerBenefitsSpouseComponent } from './broker/role-player-benefits-spouse/role-player-benefits-spouse.component';
import { RolePlayerBenefitsComponent } from './broker/role-player-benefits/role-player-benefits.component';
import { RolePlayerListComponent } from './broker/role-player-list/role-player-list.component';
import { RolePlayerPersonDialogComponent } from './broker/role-player-person-dialog/role-player-person-dialog.component';
import { RolePlayerPolicyNotesComponent } from './broker/role-player-policy-notes/role-player-policy-notes.component';
import { SpouseChildrenListComponent } from './broker/spouse-children-list/spouse-children-list.component';
import { VerifyCaseComponent } from './broker/verify-case/verify-case.component';
import { NewBusinessIndividualWizard } from './broker/wizard/new-business-individual-wizard';
import { CreateCaseComponent } from './case/create-case/create-case.component';
import { CreateCaseDocumentsComponent } from './case/create-case-documents/create-case-documents.component';
import { RepresentativeSearchComponent } from './case/representative-search/representative-search.component';
import { RepresentativeService } from './shared/services/representative.service';
import { ConfirmationDialogsService } from './shared/components/confirm-message/confirm-message.service';
import { PolicyMemberDocumentsComponent } from './broker/policy-member-documents/policy-member-documents.component';
import { NewBusinessGroupWizard } from './broker/wizard/new-business-group-wizard';
import { PolicyMemberDocumentsDataSource } from './broker/policy-member-documents/policy-member-documents-datasource';
import { MaintainPolicyDocumentsComponent } from './broker/maintain-policy-documents/maintain-policy-documents.component';
import { ManagePolicyIndividualWizard } from './broker/wizard/manage-policy-individual-wizard';
import { ManagePolicyGroupWizard } from './broker/wizard/manage-policy-group-wizard';
import { AuthService } from './core/services/auth.service';
import { PolicyListComponent } from './broker/broker-policy-list/policy-list/policy-list.component';
import { QuoteViewComponent } from './quote-view/quote-view.component';
import { QuoteService } from './shared/services/quote.service';
import { LeadService } from './shared/services/lead.service';
import { MobileViewQuoteComponent } from './mobile-view-quote/mobile-view-quote.component';
import { QuoteDocumentsComponent } from './quote-documents/quote-documents.component';
import { DeclineReasonDialogComponent } from './quote-view/decline-reason-dialog/decline-reason-dialog.component';
import { AcceptQuoteDialogComponent } from './quote-view/accept-quote-dialog/accept-quote-dialog.component';
import { MemberDocumentsComponent } from './shared/components/member-documents/member-documents.component';
import { PolicyDocumentsUploadComponent } from './broker/policy-documents-upload/policy-documents-upload.component';
import { ValidateLetterOfGoodStandingComponent } from './member/validate-letter-of-good-standing/validate-letter-of-good-standing.component';
import { ExternalUserRegistrationComponent } from './external-user-registration/external-user-registration.component';
import { RegisterNewHealthcareProviderComponent } from './external-user-registration/register-new-healthcare-provider/register-new-healthcare-provider.component';

const moment = _moment;

// See the Moment.js docs for the meaning of these formats
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM/DD',
  },
  display: {
    dateInput: 'YYYY/MM/DD',
  },
};

@NgModule({
  declarations: [
    AppComponent,
    SigninRedirectCallbackComponent,
    HomeComponent,
    SignoutRedirectCallbackComponent,
    LayoutComponent,
    MemberActivationComponent,
    UserRegistrationComponent,
    UserRegistrationDocumentsComponent,
    UserRegistrationPopupUploadDocumentComponent,
    UserRegistrationVopdFailedComponent,
    PasswordStrengthComponent,
    ForgotPasswordComponent,
    PasswordResetComponent,
    BrokerPolicyDocumentsComponent,
    BrokerPolicyListComponent,
    BrokerPolicyDetailsComponent,
    BrokerPolicyEmailAuditComponent,
    BrokerPolicySmsAuditComponent,
    BrokerDisclaimerComponent,
    PolicyDetailsDocumentComponent,
    IdleComponent,
    BrokerPremiumListingComponent,
    PremiumListingFileAuditComponent,
    BrokerExceptionReportComponent,
    BeneficiaryListComponent,
    CancelPolicyReasonDialogComponent,
    ExtendedFamilyListComponent,
    GroupMemberDetailsComponent,
    GroupPolicyBenefitsComponent,
    MainMemberDetailsComponent,
    PersonDetailsComponent,
    PolicyAddressDetailsComponent,
    PolicyBankingDetailsComponent,
    PolicyBenefitsComponent,
    PolicyCollectionDetailsComponent,
    PolicyContactDetailsComponent,
    PolicyListDialogComponent,
    PolicyProductOptionsComponent,
    PolicyScheduleComponent,
    PolicySummaryComponent,
    ReinstatePolicyDialogComponent,
    RemoveInsuredLifeNoteComponent,
    RolePlayerAddressDetailComponent,
    RolePlayerBankingDetailComponent,
    RolePlayerBenefitsComponent,
    RolePlayerBenefitsChildComponent,
    RolePlayerBenefitsExtendedComponent,
    RolePlayerBenefitsSpouseComponent,
    RolePlayerListComponent,
    RolePlayerPersonDialogComponent,
    RolePlayerPolicyNotesComponent,
    PolicyMemberDocumentsComponent,
    SpouseChildrenListComponent,
    VerifyCaseComponent,
    PreviousInsurerComponent,
    PolicyDocumentsComponent,
    CaseListComponent,
    CreateCaseComponent,
    CreateCaseDocumentsComponent,
    RepresentativeSearchComponent,
    MaintainPolicyDocumentsComponent,
    PolicyListComponent,
    QuoteViewComponent,
    MobileViewQuoteComponent,
    QuoteDocumentsComponent,
    DeclineReasonDialogComponent,
    AcceptQuoteDialogComponent,
    MemberDocumentsComponent,
    PolicyDocumentsUploadComponent,
    ValidateLetterOfGoodStandingComponent,
    ExternalUserRegistrationComponent,
    RegisterNewHealthcareProviderComponent
  ],
  imports: [
    OAuthModule.forRoot(),
    ToastrModule.forRoot(),
    NgxMaskModule.forRoot(),
    NgIdleKeepaliveModule.forRoot(),
    ModalModule.forRoot(),
    MomentModule,
    BrowserModule,
    HttpClientModule,
    NavigationModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule,
    SharedModule,
    SharedUtilitiesModule,
    RulesEngineModule,
    AngularMaterialsModule,
    MatExpansionModule,
  ],
  providers: [
    LookupService,
    UserService,
    UserRegistrationService,
    BrokerPolicyService,
    MemberPortalBrokerService,
    PolicyMemberDocumentsDataSource,
    RepresentativeService,
    ConfirmationDialogsService,
    QuoteService,
    LeadService,
    AuthService,
    { provide: OAuthStorage, useValue: localStorage },
  ],
  entryComponents: [
    DeclineReasonDialogComponent,
    AcceptQuoteDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(componentFactoryResolver: ComponentFactoryResolver, contextFacotry: WizardContextFactory) {
    contextFacotry.addWizardContext(new LinkExistingMemberWizard(componentFactoryResolver), 'link-member');
    contextFacotry.addWizardContext(new PremiumListingRejectionNotificationWizard(componentFactoryResolver), 'member-portal-notification');
    contextFacotry.addWizardContext(new NewBusinessIndividualWizard(componentFactoryResolver), 'new-business-individual');
    contextFacotry.addWizardContext(new NewBusinessGroupWizard(componentFactoryResolver), 'new-business-group');
    contextFacotry.addWizardContext(new ManagePolicyIndividualWizard(componentFactoryResolver), 'manage-policy-individual');
    contextFacotry.addWizardContext(new ManagePolicyGroupWizard(componentFactoryResolver), 'manage-policy-group');
  }
}

