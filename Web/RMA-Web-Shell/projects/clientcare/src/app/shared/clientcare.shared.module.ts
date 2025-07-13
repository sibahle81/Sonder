import { NgModule } from '@angular/core';
import { ApprovalComponent } from './approvals/approval.component';
import { AuditLogDatasource } from 'projects/shared-components-lib/src/lib/audit/audit-log.datasource';
import { ConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.component';
import { NotesDatasource } from 'projects/shared-components-lib/src/lib/notes/notes.datasource';
import { FileUtil } from 'projects/shared-utilities-lib/src/lib/file-utility/file-utility';
import { SharedUtilitiesLibModule } from 'projects/shared-utilities-lib/src/lib/shared-utilities-lib.module';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/lib/shared-components-lib.module';
import { SharedModelsLibModule } from 'projects/shared-models-lib/src/lib/shared-models-lib.module';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/lib/shared-services-lib.module';
import { AccountHistoryComponent } from 'projects/fincare/src/app/billing-manager/views/account-history/account-history.component';
import { ProductOptionDependencyComponent } from '../product-manager/views/product-option-dependency/product-option-dependency.component';
import { ProductOptionRatesComponent } from '../product-manager/views/product-option-rates/product-option-rates.component';
import { ProductOptionAllowanceTypeComponent } from '../product-manager/views/product-option-allowance-type/product-option-allowance-type.component';
import { ProductOptionBillingIntegrationComponent } from '../product-manager/views/product-option-billing-integration/product-option-billing-integration.component';
import { GeneralAuditDialogComponent } from './general-audits/general-audit-dialog/general-audit-dialog.component';
import { GeneralAuditDataSource } from './general-audits/general-audit-dialog/general-audit-dialog.datasource';
import { PolicyViewComponent } from './policy/policy-view/policy-view.component';
import { MemberViewComponent } from './member/member-view/member-view.component';
import { ViewMemberDocumentsComponent } from './member/member-view/view-member-documents/view-member-documents.component';
import { PolicyViewConfirmationDialogComponent } from './policy/policy-view/policy-view-confirmation-dialog/policy-view-confirmation-dialog.component';
import { MemberAccountExecutiveComponent } from './member/member-view/member-account-executive/member-account-executive.component';
import { LetterOfGoodStandingDialogComponent } from './member/member-view/letter-of-good-standing/letter-of-good-standing-expiry-date-dialog/letter-of-good-standing-dialog.component';
import { LetterOfGoodStandingComponent } from './member/member-view/letter-of-good-standing/letter-of-good-standing.component';
import { LetterOfGoodStandingDataSource } from './member/member-view/letter-of-good-standing/letter-of-good-standing.datasource';
import { MemberAddressComponent } from './member/member-view/member-address/member-address.component';
import { MemberBankingDetailsComponent } from './member/member-view/member-banking-details/member-banking-details.component';
import { MemberDocumentsComponent } from './member/member-view/member-documents/member-documents.component';
import { MemberRepresentativeComponent } from './member/member-view/member-representative/member-representative.component';
import { PolicyDetaisComponent } from './policy/policy-view/policy-details/policy-details.component';
import { PolicyInsuredLivesComponent } from './policy/policy-view/policy-insured-lives/policy-insured-lives.component';
import { PolicyInsuredLivesDataSource } from './policy/policy-view/policy-insured-lives/policy-insured-lives.datasource';
import { ChildPolicyListDataSource } from './policy/policy-view/child-policy-list/child-policy-list.datasource';
import { PolicyNoteComponent } from './policy/policy-view/policy-note/policy-note.component';
import { PolicyNoteDataSource } from './policy/policy-view/policy-note/policy-note.datasource';
import { PolicyStatementComponent } from './policy/policy-view/policy-statement/policy-statement.component';
import { PolicyStatementDataSource } from './policy/policy-view/policy-statement/policy-statement.datasource';
import { RateAdjustmentComponent } from './member/member-view/rate-adjustment/rate-adjustment.component';
import { PolicyClaimsComponent } from './policy/policy-view/policy-claims/policy-claims.component';
import { PolicyClaimsDataSource } from './policy/policy-view/policy-claims/policy-claims.datasource';
import { PolicyListComponent } from './policy/policy-view/policy-list/policy-list.component';
import { PolicyStatusDataSource } from './policy/policy-view/policy-status/policy-status.datasource';
import { PolicyStatusComponent } from './policy/policy-view/policy-status/policy-status.component';
import { MemberRegisterUserComponent } from './member/member-register-user/member-register-user.component';
import { MemberRegisterUserDataSource } from './member/member-register-user/member-register-user.datasource';
import { MemberRegisterUserDialogComponent } from './member/member-register-user/member-register-user-dialog/member-register-user-dialog.component';
import { MemberRegisterUserExistsDialogComponent } from './member/member-register-user/member-register-user-exists-dialog/member-register-user-exists-dialog.component';
import { MemberRegisterUserUpdateDialogComponent } from './member/member-register-user/member-register-user-update-dialog/member-register-user-update-dialog.component';
import { MemberRegisterUserContactsDialogComponent } from './member/member-register-user/member-register-user-contacts-dialog/member-register-user-contacts-dialog.component';
import { ChildPolicyListComponent } from './policy/policy-view/child-policy-list/child-policy-list.component';
import { RolePlayerService } from '../policy-manager/shared/Services/roleplayer.service';
import { RepresentativeService } from '../broker-manager/services/representative.service';
import { MemberService } from '../member-manager/services/member.service';
import { RolePlayerNoteDataSource } from './member/member-view/roleplayer-note/roleplayer-note.datasource';
import { RolePlayerNoteComponent } from './member/member-view/roleplayer-note/roleplayer-note.component';
import { RepresentativeSearchComponent } from '../broker-manager/views/representative-search/representative-search.component';
import { MemberDetailsComponent } from './member/member-view/member-details/member-details.component';
import { MemberCompanyComponent } from './member/member-view/member-company/member-company.component';
import { PolicyCoversComponent } from './policy/policy-view/policy-covers/policy-covers.component';
import { MemberDeclarationsComponent } from './member/member-view/member-declarations/member-declarations.component';
import { VarianceConfirmationDialogComponent } from './member/member-view/member-declarations/variance-confirmation-dialog/variance-confirmation-dialog.component';
import { VopdManualVerificationDialogComponent } from './vopd/vopd-manual-verification-dialog/vopd-manual-verification-dialog.component';
import { RolePlayerLettersOfGoodStandingComponent } from './member/member-view/letter-of-good-standing/roleplayer-letters-of-good-standing/roleplayer-letters-of-good-standing.component';
import { AuditLookupConverterComponent } from './general-audits/audit-lookup-converter/audit-lookup-converter.component';
import { GroupRiskDialogComponent } from './grouprisk/group-risk-dialog/group-risk-dialog.component';
import { VopdManualOverrideDialogComponent } from './vopd/vopd-manual-override-dialog/vopd-manual-override-dialog.component';
import { EuropAssistComponent } from './policy/policy-view/europ-assist/europ-assist.component';
import { CompanyViewComponent } from './company/company-view/company-view.component';
import { MemberOnlineSubmissionsComponent } from './member/member-view/member-online-submissions/member-online-submissions.component';
import { HoldingCompanyDialogComponent } from './company/holding-company-dialog/holding-company-dialog.component';
import { PersonViewComponent } from './person/person-view/person-view.component';
import { PersonEmploymentSearchComponent } from './person/person-employment-search/person-employment-search.component';
import { PersonEmploymentSearchDataSource } from './person/person-employment-search/person-employment-search.datasource';
import { PersonComponent } from './person/person/person.component';
import { PersonEmploymentComponent } from './person/person-employment/person-employment.component';
import { VopdMvpManualOverrideDialogComponent } from './vopd/vopd-mvp-manual-override-dialog/vopd-mvp-manual-override-dialog.component';
import { VopdMvpManualVerificationDialogComponent } from './vopd/vopd-mvp-manual-verification-dialog/vopd-mvp-manual-verification-dialog.component';
import { GroupRiskEmployerBranchesComponent } from './grouprisk/group-risk-employer-branches/group-risk-employer-branches.component';
import { RolePlayerPolicyRelationComponent } from './policy/policy-view/roleplayer-policy-relation/roleplayer-policy-relation.component';
import { QlinkTransactionsSearchComponent } from './policy/policy-view/qlink-transactions/qlink-transactions.component';
import { EmployeeSearchComponent } from './company/employee-search/employee-search.component';
import { CaptureEmployeeDialogComponent } from './company/employee-search/capture-employee-dialog/capture-employee-dialog.component';
import { PersonEmploymentInsuredLivesComponent } from './person/person-employment-insured-lives/person-employment-insured-lives.component';
import { PersonEmploymentBenefitDetailsComponent } from './person/person-employment-benefit-details/person-employment-benefit-details.component';
import { PersonEmploymentBenefitDetailsDialogComponent } from './person/person-employment-benefit-details/person-employment-benefit-details-dialog/person-employment-benefit-details-dialog.component';
import { PersonEmploymentInsuredLivesDialogComponent } from './person/person-employment-insured-lives/person-employment-insured-lives-dialog/person-employment-insured-lives-dialog.component';

@NgModule({
    imports: [
        SharedModelsLibModule,
        SharedComponentsLibModule,
        SharedServicesLibModule,
        SharedUtilitiesLibModule
    ],
    declarations: [
        ApprovalComponent,
        AccountHistoryComponent,
        ProductOptionDependencyComponent,
        ProductOptionRatesComponent,
        ProductOptionAllowanceTypeComponent,
        ProductOptionBillingIntegrationComponent,
        GeneralAuditDialogComponent,
        PolicyDetaisComponent,
        PolicyInsuredLivesComponent,
        PolicyListComponent,
        PolicyNoteComponent,
        PolicyViewComponent,
        MemberViewComponent,
        MemberAccountExecutiveComponent,
        MemberAddressComponent,
        MemberBankingDetailsComponent,
        MemberDocumentsComponent,
        LetterOfGoodStandingComponent,
        MemberRepresentativeComponent,
        ViewMemberDocumentsComponent,
        RateAdjustmentComponent,
        PolicyStatementComponent,
        PolicyClaimsComponent,
        LetterOfGoodStandingDialogComponent,
        PolicyViewConfirmationDialogComponent,
        PolicyStatusComponent,
        MemberRegisterUserComponent,
        MemberRegisterUserDialogComponent,
        MemberRegisterUserExistsDialogComponent,
        MemberRegisterUserUpdateDialogComponent,
        MemberRegisterUserContactsDialogComponent,
        ChildPolicyListComponent,
        RolePlayerNoteComponent,
        MemberDetailsComponent,
        MemberCompanyComponent,
        PolicyCoversComponent,
        MemberDeclarationsComponent,
        VarianceConfirmationDialogComponent,
        VopdManualVerificationDialogComponent,
        RolePlayerLettersOfGoodStandingComponent,
        AuditLookupConverterComponent,
        GroupRiskDialogComponent,
        VopdManualOverrideDialogComponent,
        EuropAssistComponent,
        CompanyViewComponent,
        MemberOnlineSubmissionsComponent,
        HoldingCompanyDialogComponent,
        PersonViewComponent,
        PersonEmploymentSearchComponent,
        PersonComponent,
        PersonEmploymentComponent,
        PersonEmploymentComponent,
        VopdMvpManualOverrideDialogComponent,
        VopdMvpManualVerificationDialogComponent,
        GroupRiskEmployerBranchesComponent,
        RolePlayerPolicyRelationComponent,
        QlinkTransactionsSearchComponent,
        EmployeeSearchComponent,
        CaptureEmployeeDialogComponent,
        PersonEmploymentInsuredLivesComponent,
        PersonEmploymentBenefitDetailsComponent,
        PersonEmploymentBenefitDetailsDialogComponent,
        PersonEmploymentInsuredLivesDialogComponent
    ],
    exports: [
        ApprovalComponent,
        RepresentativeSearchComponent,
        AccountHistoryComponent,
        ProductOptionDependencyComponent,
        ProductOptionRatesComponent,
        ProductOptionAllowanceTypeComponent,
        ProductOptionBillingIntegrationComponent,
        GeneralAuditDialogComponent,
        PolicyDetaisComponent,
        PolicyInsuredLivesComponent,
        PolicyListComponent,
        PolicyNoteComponent,
        PolicyViewComponent,
        MemberViewComponent,
        MemberAccountExecutiveComponent,
        MemberAddressComponent,
        MemberBankingDetailsComponent,
        MemberDocumentsComponent,
        LetterOfGoodStandingComponent,
        MemberRepresentativeComponent,
        ViewMemberDocumentsComponent,
        RateAdjustmentComponent,
        PolicyStatementComponent,
        PolicyClaimsComponent,
        PolicyStatusComponent,
        MemberRegisterUserComponent,
        RolePlayerNoteComponent,
        MemberDetailsComponent,
        MemberCompanyComponent,
        PolicyCoversComponent,
        MemberDeclarationsComponent,
        VarianceConfirmationDialogComponent,
        RolePlayerLettersOfGoodStandingComponent,
        AuditLookupConverterComponent,
        EuropAssistComponent,
        CompanyViewComponent,
        MemberOnlineSubmissionsComponent,
        HoldingCompanyDialogComponent,
        PersonViewComponent,
        PersonEmploymentSearchComponent,
        PersonComponent,
        PersonEmploymentComponent,
        GroupRiskEmployerBranchesComponent,
        PersonEmploymentComponent,
        RolePlayerPolicyRelationComponent,
        QlinkTransactionsSearchComponent,
        EmployeeSearchComponent,
        CaptureEmployeeDialogComponent,
        PersonEmploymentInsuredLivesComponent,
        PersonEmploymentBenefitDetailsComponent,
        PersonEmploymentBenefitDetailsDialogComponent,
        PersonEmploymentInsuredLivesDialogComponent
    ],
    providers: [
        FileUtil,
        ConfirmationDialogComponent,
        AuditLogDatasource,
        ApprovalComponent,
        NotesDatasource,
        GeneralAuditDataSource,
        PolicyInsuredLivesDataSource,
        ChildPolicyListDataSource,
        PolicyNoteDataSource,
        PolicyStatementDataSource,
        PolicyClaimsDataSource,
        LetterOfGoodStandingDataSource,
        PolicyStatusDataSource,
        MemberRegisterUserDataSource,
        RolePlayerService,
        RepresentativeService,
        MemberService,
        RolePlayerNoteDataSource,
        PersonEmploymentSearchDataSource
    ],
    entryComponents: [
        ConfirmationDialogComponent,
        ApprovalComponent,
        ProductOptionDependencyComponent,
        ProductOptionRatesComponent,
        ProductOptionAllowanceTypeComponent,
        ProductOptionBillingIntegrationComponent,
        GeneralAuditDialogComponent,
        RolePlayerNoteComponent,
        VopdManualVerificationDialogComponent,
        GroupRiskDialogComponent,
        VopdManualOverrideDialogComponent,
        GroupRiskEmployerBranchesComponent
    ]
})
export class ClientCareSharedModule {
}
