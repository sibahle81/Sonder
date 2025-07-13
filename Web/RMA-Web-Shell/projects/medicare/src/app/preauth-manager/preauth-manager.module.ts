
import { NgModule, ComponentFactoryResolver } from '@angular/core';

import { SharedServicesLibModule } from './../../../../shared-services-lib/src/lib/shared-services-lib.module';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { SharedModule } from 'src/app/shared/shared.module';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { FrameworkModule } from 'src/app/framework.module';

import { PreAuthClaimSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-claim-search/preauth-claim-search.component';
import { PreAuthManagerRoutingModule } from 'projects/medicare/src/app/preauth-manager/preauth-manager-routing.module';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { MediManagerModule } from 'projects/medicare/src/app/medi-manager/medi-manager.module';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component';
import { PreAuthWorkOverviewComponent } from './views/preauth-work-overview/preauth-work-overview.component';
import { PreAuthWorkItemSelectorComponent } from './views/preauth-work-item-selector/preauth-work-item-selector.component';
import { PreAuthWorkItemMenuComponent } from './views/preauth-work-item-menu/preauth-work-item-menu.component';
import { PreAuthFormWizardContext } from './views/wizards/preauth-form/preauth-form-wizard';
import { PreAuthCaptureComponent } from './views/wizards/preauth-capture/preauth-capture.component';
import { PreAuthDiagnosisComponent } from '../medi-manager/views/shared/preauth-diagnosis/preauth-diagnosis.component';
import { Icd10codesGridComponent } from '../medi-manager/views/shared/icd10codes-grid/icd10codes-grid.component';
import { PreauthIcd10SearchDialogComponent } from 'projects/medicare/src/app/medi-manager/views/shared/icd10-search-dialog/preauth-icd10-search-dialog.component';
import { PreauthListComponent } from './views/preauth-list/preauth-list-component';
import { PreAuthorisationListDataSource } from './datasources/preauth-list-datasource';
import { PreauthSearchComponent } from './views/preauth-search/preauth-search-component';
import { PreAuthorisationSearchDataSource } from './datasources/preauth-search-datasource';
import { TariffSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/tariff-search/tariff-search.component';
import { PreauthTreatmentCodeSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-treatmentcode-search/preauth-treatmentcode-search.component';
import { TreatmentCodeSearchDataSource } from 'projects/medicare/src/app/medi-manager/datasources/treatmentCode-search-datasource';
import { PreauthBreakdownComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';
import { PreauthOverviewComponent } from 'projects/medicare/src/app/preauth-manager/views/preauth-overview/preauth-overview.component';
import { TreatingDoctorPreauthComponent } from 'projects/medicare/src/app/medi-manager/views/shared/treating-doctor-preauth/treating-doctor-preauth.component';
import { CrosswalkSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-crosswalk-search/preauth-crosswalk-search.component';
import { PhysioOTPreAuthComponent } from 'projects/medicare/src/app/preauth-manager/views/physio-ot-preauth/physio-ot-preauth.component';
import { PreAuthHCPComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-hcp/preauth-hcp.component';
import { PreAuthDetailsComponent } from 'projects/medicare/src/app/preauth-manager/views/preauth-view/preauth-details/preauth-details.component';
import { PreAuthViewComponent } from 'projects/medicare/src/app/preauth-manager/views/preauth-view/preauth-view.component';
import { PreAuthTreatingDoctorDetailsComponent } from 'projects/medicare/src/app/preauth-manager/views/preauth-view/preauth-treating-doctor-details/preauth-treating-doctor-details.component';
import { PreAuthBreakDownsComponent } from 'projects/medicare/src/app/preauth-manager/views/helpers/components/preauth-breakdowns/preauth-breakdowns.component';
import { PreAuthPhysioComponent } from 'projects/medicare/src/app/preauth-manager/views/preauth-view/preauth-physio/preauth-physio.component';
import { SearchPreauthorisationComponent } from 'projects/medicare/src/app/preauth-manager/views/search-preauthorisation/search-preauthorisation.component';

import { PreAuthReviewWizardContext } from 'projects/medicare/src/app/preauth-manager/views/wizards/preauth-form/preauth-review-wizard';
import { PreauthReviewComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-review/preauth-review.component';
import { PreauthIcd10EditComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-icd10-edit/preauth-icd10-edit.component';
import { PreAuthReviewerComponent } from 'projects/medicare/src/app/preauth-manager/views/preauth-reviewer/preauth-reviewer.component';
import { PreauthClaimViewComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-claim-view/preauth-claim-view.component';
import { PreauthHcpViewComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-hcp-view/preauth-hcp-view.component';
import { PreAuthReviewBreakdownComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-review-breakdown/preauth-review-breakdown.component';
import { PreAuthEditWizardContext } from 'projects/medicare/src/app/preauth-manager/views/wizards/preauth-form/preauth-edit-wizard';
import { PreAuthICD10CodesComponent } from 'projects/medicare/src/app/preauth-manager/views/helpers/components/pre-auth-icd10-codes/preauth-icd10-codes.component';
import { PreAuthTreatingBasketsComponent } from 'projects/medicare/src/app/preauth-manager/views/helpers/components/preauth-treatmeant-baskets/preauth-treatmeant-baskets.component';
import { LevelOfCareComponent } from 'projects/medicare/src/app/preauth-manager/views/helpers/components/level-of-care/level-of-care.component';
import { PreAuthActivityComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-activity/preauth-activity.component';
import { PreauthDetailsEditComponent } from 'projects/medicare/src/app/preauth-manager/views/wizards/preauth-details-edit/preauth-details-edit.component';
import { HealthcareProviderPreAuthSegmentAccess } from 'projects/medicare/src/app/preauth-manager/helpers/healthcare-provider-segment-access';
import { HospitalVisitDetailsComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/hospital-visit-details/hospital-visit-details.component';
import { NotificationWizard } from 'projects/fincare/src/app/billing-manager/wizards/notification-wizard';
import { AllocateMedicalUserComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-workpool/allocate-medical-user.component';
import { ReAllocateMedicalUserComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-workpool/re-allocate-medical-user.component';
import { MedicalReportListComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/medical-report-list/medical-report-list.component';
import { MedicareSearchMenusComponent } from '../shared/components/medicare-search-menus/medicare-search-menus.component';
import { TreatmentPreAuthDetailsComponent } from '../preauth-manager/views/treatment-preauth-details/treatment-preauth-details.component';
import { ChronicPreauthDetailsComponent } from 'projects/medicare/src/app/preauth-chronic-manager/views/chronic-preauth-details/chronic-preauth-details.component';
import { ChronicFormDetailsComponent } from 'projects/medicare/src/app/preauth-chronic-manager/views/chronic-form-details/chronic-form-details.component';
import { TreatmentPreAuthReviewerComponent } from 'projects/medicare/src/app/preauth-manager/views/treatment-preauth-review/treatment-preauth-reviewer.component';
import { TreatmentPreAuthReviewWizardContext } from 'projects/medicare/src/app/preauth-manager/views/wizards/treatment-preauth-review-wizard';
import { ClaimReopeningPreAuthComponent } from 'projects/medicare/src/app/preauth-manager/views/claim-reopening-form/claim-reopening-form.component';

import { ChronicPreAuthReviewerComponent } from 'projects/medicare/src/app/preauth-manager/views/chronic-preauth-review/chronic-preauth-reviewer.component';
import { ChronicPreAuthReviewWizardContext } from 'projects/medicare/src/app/preauth-manager/views/wizards/chronic-preauth-review-wizard';
import { ChronicPreAuthEditWizardContext } from 'projects/medicare/src/app/preauth-manager/views/wizards/chronic-preauth-edit-wizard';


import { ChronicApplicationType } from 'projects/medicare/src/app//preauth-chronic-manager/views/chronic-application-type/chronic-application-type.component';
import { RehabilitationFormComponent } from 'projects/medicare/src/app/preauth-treatment-manager/views/rehabilitation-form/rehabilitation-form.component';
import { RehabilitationFormDetailsComponent } from 'projects/medicare/src/app/preauth-treatment-manager/views/shared/rehabilitation-form-details/rehabilitation-form-details.component';
import { ReopeningFormDetailsComponent } from 'projects/medicare/src/app/preauth-treatment-manager/views/shared/reopening-form-details/reopening-form-details.component';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { ProsthetistQuoteCaptureWizardContext } from './views/wizards/prosthetist-quote-capture-wizard';
import { ProsthetistQuoteCaptureComponent } from './views/wizards/prosthetist-quote-capture/prosthetist-quote-capture.component';
import { IsInOROutHospitalCheckComponent } from './views/is-in-or-out-hospital-check/is-in-or-out-hospital-check.component';
import { ProsthetistQuoteListComponent } from './views/prosthetist-quote-list/prosthetist-quote-list.component';
import { ProsthetistQuoteViewComponent } from './views/prosthetist-quote-view/prosthetist-quote-view.component';
import { ProsthetistPreauthCaptureWizard } from './views/wizards/prosthetist-preauth-capture-wizard';
import { ProsthetistPreauthDetailsComponent } from './views/prosthetist-preauth-details/prosthetist-preauth-details.component';
import { ProstheticQuotationTypeComponent } from './views/prosthetic-quotation-type/prosthetic-quotation-type.component';
import { ProstheticPreAuthReviewerComponent } from './views/prosthetic-preauth-review/prosthetic-preauth-reviewer.component';
import { ProstheticPreAuthReviewWizardContext } from './views/wizards/prosthetic-preauth-review-wizard';
import { ProsthetistPreauthEditWizard } from 'projects/medicare/src/app/preauth-manager/views/wizards/prosthetist-preauth-edit-wizard';
import { MedicalInvoiceLineUnderAssessReasonColorPipe } from '../medical-invoice-manager/pipes/medical-invoice-line-under-assess-reason-color.pipe';
import { MedicalInvoiceStatusColorPipe } from '../medical-invoice-manager/pipes/medical-invoice-status-color.pipe';
import { MedicalInvoiceTotalsCalculationsPipe } from '../medical-invoice-manager/pipes/medical-invoice-totals-calculations.pipe';
import { MedicalInvoiceValidationsPipe } from '../medical-invoice-manager/pipes/medical-invoice-validations.pipe';
import { SwitchBatchInvoiceStatusColorPipe } from '../medical-invoice-manager/pipes/switch-batch-invoice-status-color.pipe';
import { PreAuthReviewExternalSourceWizardContext } from './views/wizards/preauth-form/preauth-review-external-source-wizard';
import { TravelAuthListComponent } from './views/travel-auth-list/travel-auth-list.component';
import { ManageTravelAuthComponent } from './views/manage-travel-auth/manage-travel-auth.component';
import { MaaRoutingWizardComponent } from './views/wizards/maa-review-routing/maa-routing-wizard/maa-routing-wizard.component';
import { MaaRoutingHolisticViewComponent } from './views/wizards/maa-review-routing/maa-routing-holistic-view/maa-routing-holistic-view.component';
import { MaaRoutingWizardContext } from './views/wizards/maa-review-routing/maa-routing-wizard/maa-routing-wizard';
import { ClaimCareSharedModule } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/claim-care-shared.module';
import { TreatmentPreauthDocumentTypeComponent } from './views/treatment-preauth-document-type/treatment-preauth-document-type.component';
import { TravelauthDeleteModalComponent } from './modals/travelauth-delete-modal/travelauth-delete-modal.component';
import { PreauthDeleteModalComponent } from './modals/preauth-delete-modal/preauth-delete-modal.component';


@NgModule({
    imports: [
        FrameworkModule,
        MaterialsModule,
        PreAuthManagerRoutingModule,
        WizardModule,
        SharedModule,
        MediManagerModule,
        MedicareSearchMenusComponent
    ],
    declarations: [
        PreAuthWorkOverviewComponent,
        PreAuthWorkItemSelectorComponent,
        PreAuthWorkItemMenuComponent,
        PreAuthCaptureComponent,
        PreAuthClaimSearchComponent,
        PreAuthDiagnosisComponent,
        HealthCareProviderSearchComponent,
        PreauthIcd10SearchDialogComponent,
        PreauthListComponent,
        PreauthSearchComponent,
        TariffSearchComponent,
        PreauthTreatmentCodeSearchComponent,
        PreauthOverviewComponent,
        TreatingDoctorPreauthComponent,
        PreauthBreakdownComponent,
        CrosswalkSearchComponent,
        PhysioOTPreAuthComponent,
        PreAuthHCPComponent,
        PreAuthViewComponent,
        PreAuthDetailsComponent,
        PreAuthTreatingDoctorDetailsComponent,
        HospitalVisitDetailsComponent,
        PreAuthBreakDownsComponent,
        PreAuthPhysioComponent,
        SearchPreauthorisationComponent,
        PreauthReviewComponent,
        PreauthIcd10EditComponent,
        PreauthClaimViewComponent,
        PreauthHcpViewComponent,
        PreAuthReviewerComponent,
        PreAuthReviewBreakdownComponent,
        LevelOfCareComponent,
        PreAuthICD10CodesComponent,
        PreAuthTreatingBasketsComponent,
        PreAuthActivityComponent,
        PreauthDetailsEditComponent,
        Icd10codesGridComponent,
        AllocateMedicalUserComponent,
        ReAllocateMedicalUserComponent,
        MedicalReportListComponent,
        TreatmentPreAuthDetailsComponent,
        ChronicPreauthDetailsComponent,
        TreatmentPreAuthReviewerComponent, 
        ChronicPreAuthReviewerComponent,
        ProstheticPreAuthReviewerComponent,      
        ChronicApplicationType,
        RehabilitationFormComponent,
        RehabilitationFormDetailsComponent,
        ChronicFormDetailsComponent,
        ReopeningFormDetailsComponent,
        ClaimReopeningPreAuthComponent,
        ProsthetistQuoteCaptureComponent,
        IsInOROutHospitalCheckComponent,
        ProsthetistQuoteListComponent,
        ProsthetistQuoteViewComponent,
        ProsthetistPreauthDetailsComponent,
        ProstheticQuotationTypeComponent,
        TravelAuthListComponent,
        ManageTravelAuthComponent,
        MaaRoutingWizardComponent,
        MaaRoutingHolisticViewComponent,
        PreauthDeleteModalComponent,
        TravelauthDeleteModalComponent,
        TreatmentPreauthDocumentTypeComponent
    ],
    exports: [
        PreauthIcd10SearchDialogComponent,
        HealthCareProviderSearchComponent,
        TariffSearchComponent,
        PreauthBreakdownComponent,
        PreAuthDiagnosisComponent,
        PreAuthDetailsComponent,
        TariffSearchComponent,
        PreAuthClaimSearchComponent,
        PreAuthTreatingDoctorDetailsComponent,
        PreAuthBreakDownsComponent,
        PreAuthTreatingDoctorDetailsComponent,
        HospitalVisitDetailsComponent,
        PreAuthViewComponent,
        PreAuthICD10CodesComponent,
        PreauthIcd10EditComponent,
        MedicalReportListComponent,
        PreauthListComponent,
        TreatmentPreAuthDetailsComponent,
        ChronicPreauthDetailsComponent,
        IsInOROutHospitalCheckComponent,
        PreauthDeleteModalComponent,
        TravelauthDeleteModalComponent
    ],
    entryComponents: [
        PreAuthCaptureComponent,
        PreAuthClaimSearchComponent,
        PreAuthDiagnosisComponent,
        HealthCareProviderSearchComponent,
        TariffSearchComponent,
        PreauthIcd10SearchDialogComponent,
        PreauthTreatmentCodeSearchComponent,
        PreauthBreakdownComponent,
        TreatingDoctorPreauthComponent,
        CrosswalkSearchComponent,
        PhysioOTPreAuthComponent,
        PreAuthHCPComponent,
        PreauthReviewComponent,
        PreauthIcd10EditComponent,
        PreAuthReviewerComponent,
        PreAuthReviewBreakdownComponent,
        PreauthDetailsEditComponent,
        PreAuthViewComponent,
        AllocateMedicalUserComponent,
        ReAllocateMedicalUserComponent,
        MedicalReportListComponent,
        TreatmentPreAuthDetailsComponent,
        ChronicPreauthDetailsComponent,
        TreatmentPreAuthReviewerComponent,  
        ChronicPreAuthReviewerComponent,
        ProstheticPreAuthReviewerComponent,     
        ChronicApplicationType,
        RehabilitationFormComponent,
        ClaimReopeningPreAuthComponent,
        ManageTravelAuthComponent,
        PreauthDeleteModalComponent,
        TravelauthDeleteModalComponent
      ],
    providers: [
        SharedServicesLibModule,
        MediCarePreAuthService,
        HealthcareProviderService,
        PreAuthorisationListDataSource,
        PreAuthorisationSearchDataSource,
        TreatmentCodeSearchDataSource,
        PreauthBreakdownComponent,
        HealthcareProviderPreAuthSegmentAccess
    ],
    bootstrap: []
})
export class PreAuthManagerModule {
  constructor(componentFactoryResolver: ComponentFactoryResolver, contextFactory: WizardContextFactory, healthcareProviderPreAuthSegmentAccess: HealthcareProviderPreAuthSegmentAccess) {
    // register the context factories used in the wizard controls
    contextFactory.addWizardContext(new PreAuthFormWizardContext(componentFactoryResolver), 'preauth-capture-form');
    contextFactory.addWizardContext(new PreAuthReviewWizardContext(componentFactoryResolver), 'review-preauth');
    contextFactory.addWizardContext(new PreAuthEditWizardContext(componentFactoryResolver), 'edit-preauth');
    contextFactory.addWizardContext(new NotificationWizard(componentFactoryResolver), 'capture-preauth-notification');
    contextFactory.addWizardContext(new PreAuthReviewWizardContext(componentFactoryResolver), 'edit-preauth-notification');
    contextFactory.addWizardContext(new PreAuthReviewWizardContext(componentFactoryResolver), 'review-preauth-notification');
    contextFactory.addWizardContext(new TreatmentPreAuthReviewWizardContext(componentFactoryResolver), 'review-treatment-preauth');
    contextFactory.addWizardContext(new ProsthetistQuoteCaptureWizardContext(componentFactoryResolver), 'capture-preauth-prosthetist-quote');
    contextFactory.addWizardContext(new ProsthetistPreauthCaptureWizard(componentFactoryResolver), 'capture-preauth-prosthetist');
    contextFactory.addWizardContext(new ChronicPreAuthReviewWizardContext(componentFactoryResolver), 'review-chronic-preauth');
    contextFactory.addWizardContext(new ChronicPreAuthEditWizardContext(componentFactoryResolver), 'edit-chronic-preauth');
    contextFactory.addWizardContext(new ProstheticPreAuthReviewWizardContext(componentFactoryResolver), 'review-prosthetic-preauth');
    contextFactory.addWizardContext(new ProsthetistPreauthEditWizard(componentFactoryResolver), 'edit-prosthetic-preauth');
    contextFactory.addWizardContext(new MaaRoutingWizardContext(componentFactoryResolver), 'maa-preauth-review-routing');
    contextFactory.addWizardContext(new PreAuthReviewExternalSourceWizardContext(componentFactoryResolver), 'review-preauth-hum');
    contextFactory.addWizardContext(new PreAuthReviewExternalSourceWizardContext(componentFactoryResolver), 'review-preauth-cca');
    contextFactory.addWizardContext(new PreAuthReviewExternalSourceWizardContext(componentFactoryResolver), 'review-preauth-case-management');
    contextFactory.addWizardContext(new ProsthetistQuoteCaptureWizardContext(componentFactoryResolver), 'review-preauth-prosthetist-quote');
    healthcareProviderPreAuthSegmentAccess.checkAndSetHealthcareProviderPreAuthAccessRights();
  }

}

