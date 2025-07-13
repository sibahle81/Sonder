import { RepresentativeService } from 'projects/clientcare/src/app/broker-manager/services/representative.service';
import { MemberWizard } from './wizards/member-wizard';
import { MemberHomeComponent } from './views/member-home/member-home.component';
import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AuditLogService } from 'projects/shared-components-lib/src/lib/audit/audit-log.service';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { MemberManagerRoutingModule } from './member-manager-routing.module';
import { ClientCareSharedModule } from '../shared/clientcare.shared.module';
import { MemberLayoutComponent } from './views/member-layout/member-layout.component';
import { MemberSearchComponent } from './views/member-search/member-search.component';
import { MemberBankingDetailsWizardComponent } from './views/member-banking-details-wizard/member-banking-details-wizard.component';
import { MemberContactDetailsWizardComponent } from './views/member-contact-details-wizard/member-contact-details-wizard.component';
import { RolePlayerService } from '../policy-manager/shared/Services/roleplayer.service';
import { MemberWholisticViewComponent } from './views/member-wholistic-view/member-wholistic-view.component';
import { MemberDetailsWizardComponent } from './views/member-details-wizard/member-details-wizard.component';
import { MemberCancelComponent } from './views/member-cancel/member-cancel.component';
import { IndustryClassDeclarationConfigurationWizardComponent } from './views/renewals/industry-class-declaration-configuration-wizard/industry-class-declaration-configuration-wizard.component';
import { IndustryClassDeclarationConfigurationWizard } from './wizards/industry-class-declaration-configuration.wizard';
import { DeclarationVarianceWizard } from './wizards/declaration-variance.wizard';
import { DeclarationVarianceWizardComponent } from './views/renewals/declaration-variance-wizard/declaration-variance-wizard.component';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { RateAdjustmentWizardComponent } from './views/renewals/rate-adjustment-wizard/rate-adjustment-wizard.component';
import { RateAdjustmentWizard } from './wizards/rate-adjustment.wizard';
import { UploadRatesComponent } from './views/upload-rates/upload-rates.component';
import { ManageIndustryClassDeclarationConfigurationComponent } from './views/renewals/manage-industry-class-declaration-configuration/manage-industry-class-declaration-configuration.component';
import { IndustryClassDeclarationConfigurationComponent } from './views/renewals/industry-class-declaration-configuration/industry-class-declaration-configuration.component';
import { MaximumAverageEarningsDialogComponent } from './views/renewals/industry-class-declaration-configuration/maximum-average-earnings-dialog/maximum-average-earnings-dialog.component';
import { MemberRenewalLetterAuditComponent } from './views/renewals/member-renewal-letter-audit/member-renewal-letter-audit.component';
import { ResendMemberRenewalLetterComponent } from './views/renewals/resend-member-renewal-letter/resend-member-renewal-letter.component';
import { MemberWhatsappListComponent } from './views/renewals/member-whatsapp-list/member-whatsapp-list.component';
import { MemberWhatappContactDialogComponent } from './views/renewals/member-whatapp-contact-dialog/member-whatapp-contact-dialog.component';
import { WhatsappCompanyListWizard } from './wizards/whatsapp-company-list.wizard';
import { WhatsappCompanyListWizardComponent } from 'projects/clientcare/src/app/member-manager/views/renewals/whatsapp-company-list-wizard/whatsapp-company-list-wizard.component';
import { UploadErrorListDataSource } from './views/upload-rates/upload-error-list/upload-error-list.datasource';
import { UploadErrorListComponent } from './views/upload-rates/upload-error-list/upload-error-list.component';
import { DeclarationAssistanceWizard } from './wizards/declaration-assistance.wizard';
import { DeclarationAssistanceWizardComponent } from './views/renewals/declaration-assistance-wizard/declaration-assistance-wizard.component';
import { MemberCollectionReportsComponent } from './views/member-collection-reports/member-collection-reports.component';
import { MemberRenewalReportsComponent } from './views/member-renewal-reports/member-renewal-reports.component';
import { LiveInAllowanceDialogComponent } from './views/renewals/industry-class-declaration-configuration/live-in-allowance-dialog/live-in-allowance-dialog.component';
import { MemberDashboardComponent } from './views/member-dashboard/member-dashboard.component';
import { PenaltyConfigurationDialogComponent } from './views/renewals/industry-class-declaration-configuration/penalty-configuration-dialog/penalty-configuration-dialog.component';
import { InflationPercentageConfigurationDialogComponent } from './views/renewals/industry-class-declaration-configuration/inflation-percentage-configuration-dialog/inflation-percentage-configuration-dialog.component';
import { MinimumPremiumConfigurationDialogComponent } from './views/renewals/industry-class-declaration-configuration/minimum-premium-configuration-dialog/minimum-premium-configuration-dialog.component';
import { HolisticRolePlayerViewComponent } from './views/holistic-role-player-view/holistic-role-player-view.component';
import { RolePlayerDetailsStepComponent } from './wizards/role-player-onboarding/steps/role-player-details-step/role-player-details-step.component';
import { RolePlayerInformationComponent } from './wizards/role-player-onboarding/steps/role-player-information/role-player-information.component';
import { RolePlayerContactsComponent } from './wizards/role-player-onboarding/steps/role-player-contacts/role-player-contacts.component';
import { RolePlayerAddressComponent } from './wizards/role-player-onboarding/steps/role-player-address/role-player-address.component';
import { RolePlayerBankAccountsComponent} from './wizards/role-player-onboarding/steps/role-player-bank-accounts/role-player-bank-accounts.component';
import { RolePlayerNotesComponent} from './wizards/role-player-onboarding/steps/role-player-notes/role-player-notes.component';
import { RolePlayerDocumentsComponent} from './wizards/role-player-onboarding/steps/role-player-documents/role-player-documents.component';
import { RolePlayerOnboardingWizard } from './wizards/role-player-onboarding/role-player-onboarding-wizard';
import { GroupRiskPremiumRateDetailComponent } from "./views/renewals/group-risk-premium-rate-detail/group-risk-premium-rate-detail.component";
import {ManageGroupRiskPremiumRatesWizard} from "./wizards/manage-grouprisk-premium-rates.wizard";
import {
  CreateGroupRiskPremiumRatesComponent
} from "./views/renewals/create-group-risk-premium-rates/create-group-risk-premium-rates.component";
import {
  GroupRiskPremiumRateNotesComponent
} from "./views/renewals/group-risk-premium-rate-notes/group-risk-premium-rate-notes.component";
import {
  GroupRiskPremiumRateDetailViewComponent
} from "./views/renewals/group-risk-premium-rate-detail-view/group-risk-premium-rate-detail-view.component";

@NgModule({
    imports: [
        MemberManagerRoutingModule,
        FrameworkModule,
        ClientCareSharedModule,
        WizardModule
    ],
    declarations: [
        MemberHomeComponent,
        MemberLayoutComponent,
        MemberSearchComponent,
        MemberBankingDetailsWizardComponent,
        MemberContactDetailsWizardComponent,
        MemberWholisticViewComponent,
        MemberDetailsWizardComponent,
        MemberCancelComponent,
        IndustryClassDeclarationConfigurationComponent,
        ManageIndustryClassDeclarationConfigurationComponent,
        IndustryClassDeclarationConfigurationWizardComponent,
        DeclarationVarianceWizardComponent,
        DeclarationAssistanceWizardComponent,
        MaximumAverageEarningsDialogComponent,
        RateAdjustmentWizardComponent,
        UploadRatesComponent,
        ManageIndustryClassDeclarationConfigurationComponent,
        MemberRenewalLetterAuditComponent,
        ResendMemberRenewalLetterComponent,
        MemberWhatsappListComponent,
        MemberWhatappContactDialogComponent,
        WhatsappCompanyListWizardComponent,
        UploadErrorListComponent,
        MemberCollectionReportsComponent,
        MemberRenewalReportsComponent,
        LiveInAllowanceDialogComponent,
        MemberDashboardComponent,
        PenaltyConfigurationDialogComponent,
        InflationPercentageConfigurationDialogComponent,
        MinimumPremiumConfigurationDialogComponent,
        HolisticRolePlayerViewComponent,
        RolePlayerDetailsStepComponent,
        RolePlayerInformationComponent,
        CreateGroupRiskPremiumRatesComponent,
        GroupRiskPremiumRateDetailComponent,
        RolePlayerContactsComponent,
        RolePlayerAddressComponent,
        RolePlayerBankAccountsComponent,
        RolePlayerNotesComponent,
        RolePlayerDocumentsComponent,
        GroupRiskPremiumRateNotesComponent,
        GroupRiskPremiumRateDetailViewComponent

    ],
    exports: [
        MemberSearchComponent,
        UploadErrorListComponent
    ],
    entryComponents: [
        MemberBankingDetailsWizardComponent,
        MemberContactDetailsWizardComponent,
        MemberDetailsWizardComponent,
        IndustryClassDeclarationConfigurationWizardComponent,
        DeclarationVarianceWizardComponent,
        DeclarationAssistanceWizardComponent,
        RateAdjustmentWizardComponent,
        WhatsappCompanyListWizardComponent,
        GroupRiskPremiumRateDetailComponent


    ],
    providers: [
        AuthService,
        AuditLogService,
        RolePlayerService,
        RepresentativeService,
        LookupService,
        UploadErrorListDataSource
    ]
})
export class MemberManagerModule {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    wizardContextFactory: WizardContextFactory) {
    wizardContextFactory.addWizardContext(new MemberWizard(componentFactoryResolver), 'member');
    wizardContextFactory.addWizardContext(new DeclarationVarianceWizard(componentFactoryResolver), 'declaration-variance');
    wizardContextFactory.addWizardContext(new DeclarationAssistanceWizard(componentFactoryResolver), 'declaration-assistance');

    wizardContextFactory.addWizardContext(new IndustryClassDeclarationConfigurationWizard(componentFactoryResolver), 'industry-class-declaration-configuration');
    wizardContextFactory.addWizardContext(new RateAdjustmentWizard(componentFactoryResolver), 'rate-adjustment');
    wizardContextFactory.addWizardContext(new WhatsappCompanyListWizard(componentFactoryResolver), 'whatsapp-company-list');

    wizardContextFactory.addWizardContext(new RolePlayerOnboardingWizard(componentFactoryResolver), 'roleplayer-onboarding');

    wizardContextFactory.addWizardContext(new ManageGroupRiskPremiumRatesWizard(componentFactoryResolver), 'manage-grouprisk-premium-rates');
  }
}
