import { HealthcareProviderService } from './services/healthcareProvider.service';
import { DatePipe } from '@angular/common';
import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';

import { SharedServicesLibModule } from 'projects/shared-services-lib/src/public-api';
import { SharedModule } from 'src/app/shared/shared.module';
import { MediHomeComponent } from './views/medi-home/medi-home.component';
import { MediManagerRoutingModule } from './medi-manager-routing.module';
import { MediCareLayoutComponent } from './Views/medicare-layout/medicare-layout.component';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { CrosswalkSearchComponentService } from 'projects/medicare/src/app/medi-manager/services/crosswalkSearchService';
import { PreauthWorkItemsListComponent } from 'projects/medicare/src/app/medi-manager/Views/preauth-work-items-list/preauth-work-items-list.component';
import { MedicalInvoiceTotalsCalculationsPipe } from 'projects/medicare/src/app/medical-invoice-manager/pipes/medical-invoice-totals-calculations.pipe';
import { DataShareService } from 'projects/medicare/src/app/medical-invoice-manager/datasources/medicare-medical-invoice-share-data.service';
import { PreAuthWorkpoolComponent } from 'projects/medicare/src/app/medi-manager/Views/shared/preauth-workpool/preauth-workpool.component';
import { MedicalInvoiceValidationsPipe } from 'projects/medicare/src/app/medical-invoice-manager/pipes/medical-invoice-validations.pipe';
import { MedicalInvoiceStatusColorPipe } from 'projects/medicare/src/app/medical-invoice-manager/pipes/medical-invoice-status-color.pipe';
import { MedicalInvoiceLineUnderAssessReasonColorPipe } from 'projects/medicare/src/app/medical-invoice-manager/pipes/medical-invoice-line-under-assess-reason-color.pipe';
import { ClaimCareSharedModule } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/claim-care-shared.module';
import { UrlService } from '../medical-invoice-manager/services/url.service';
import { InvoiceSwitchBatchConditionalIconsPipe } from './pipes/invoice-switch-batch-conditional-icons.pipe';
import { MediCareService } from './services/medicare.service';
import { MedicareSearchMenusComponent } from '../shared/components/medicare-search-menus/medicare-search-menus.component';
import { SwitchBatchInvoiceStatusColorPipe } from '../medical-invoice-manager/pipes/switch-batch-invoice-status-color.pipe';
import { ViewSearchResultsComponent } from './Views/shared/view-search-results/view-search-results.component';
import { MedicareViewResultsGenericActionMenu } from 'projects/medicare/src/app/shared/components/medicare-view-results-generic-action-menu/medicare-view-results-generic-action-menu.component';
import { MedicalTariffComponent } from 'projects/medicare/src/app/medi-manager/Views/shared/medical-tariff/medical-tariff.component';
import { ViewMedicalTariffComponent } from 'projects/medicare/src/app/medi-manager/Views/shared/view-medical-tariff/view-medical-tariff.component';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { ClientCareSharedModule } from 'projects/clientcare/src/app/shared/clientcare.shared.module';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { WorkPoolContainerMedicalComponent } from './Views/workpools/work-pool-container-medical/work-pool-container-medical.component';
import { WorkPoolFilterMedicalComponent } from './Views/workpools/work-pool-filter-medical/work-pool-filter-medical.component';
import { EmployeeWorkPoolMedicalComponent } from './Views/workpools/employee-work-pool-medical/employee-work-pool-medical.component';
import { PMPManagerModule } from '../pmp-manager/pmp-manager.module';
import { TebaInvoiceCaptureDetailsComponent } from './Views/shared/wizards/teba-invoice-capture-details/teba-invoice-capture-details.component';
import { MedicalInvoiceBreakdownDetailsComponent } from '../shared/components/medical-invoice-breakdown-details/medical-invoice-breakdown-details.component';
import { CroswalkSearchPreauthBreakdownComponent } from './Views/shared/preauth-crosswalk-search/crosswalk-search-preauthbreakdown';
import { PreauthSearchFullComponent } from './Views/shared/preauth-search-full/preauth-search-full.component';
import { TreatmentCodeSearchPreauthBreakdownComponent } from './Views/shared/preauth-treatmentcode-search/treatmentcode-search-preauthbreakdown';
import { TebaInvoiceWizardContext } from './Views/shared/wizards/teba-invoice-wizard';
import { PreauthWorkItemSearchComponent } from './Views/preauth-work-item-search/preauth-work-item-search.component';
import { InvoiceSwitchBatchListComponent } from './Views/shared/invoice-switch-batch-list/invoice-switch-batch-list.component';
import { InvoiceSwitchBatchSearchComponent } from './Views/shared/invoice-switch-batch-search/invoice-switch-batch-search.component';
import { InvoiceSwitchBatchUnprocessedMilistComponent } from './Views/shared/invoice-switch-batch-unprocessed-milist/invoice-switch-batch-unprocessed-milist.component';
import { InvoiceSwitchBatchViewDetailsComponent } from './Views/shared/invoice-switch-batch-view-details/invoice-switch-batch-view-details.component';
import { MedicalInvoiceManagerModule } from '../medical-invoice-manager/medical-invoice-manager.module';
import { MedicalInvoiceListComponent } from '../medical-invoice-manager/views/medical-invoice-list/medical-invoice-list.component';
import { UnderAssessReasonsViewerComponent } from '../shared/components/under-assess-reasons-viewer/under-assess-reasons-viewer.component';
import { TebaInvoiceListComponent } from './Views/shared/teba-invoice-list/teba-invoice-list.component';
import { WizardMediHolisticViewComponent } from '../shared/components/wizard-medi-holistic-view/wizard-medi-holistic-view.component';
import { PersonEventViewComponent } from '../shared/components/person-event-view/person-event-view.component';

@NgModule({
    imports: [
        MaterialsModule,
        FrameworkModule,
        MediManagerRoutingModule,
        SharedModule,
        ClaimCareSharedModule,
        WizardModule,
        SharedComponentsLibModule,
        ClientCareSharedModule,
        PMPManagerModule,
        //--Standalone components
        MedicareSearchMenusComponent,
        UnderAssessReasonsViewerComponent,
        MedicalInvoiceBreakdownDetailsComponent,
        MedicalInvoiceListComponent,
        SwitchBatchInvoiceStatusColorPipe
    ],
    declarations: [
        MediHomeComponent,
        MediCareLayoutComponent,
        PreauthSearchFullComponent,
        TreatmentCodeSearchPreauthBreakdownComponent,
        CroswalkSearchPreauthBreakdownComponent,
        PreauthWorkItemSearchComponent,
        PreauthWorkItemsListComponent,
        InvoiceSwitchBatchSearchComponent,
        InvoiceSwitchBatchListComponent,
        InvoiceSwitchBatchViewDetailsComponent,
        InvoiceSwitchBatchUnprocessedMilistComponent,
        PreAuthWorkpoolComponent,
        InvoiceSwitchBatchConditionalIconsPipe,
        ViewSearchResultsComponent,
        MedicareViewResultsGenericActionMenu,
        MedicalTariffComponent,
        ViewMedicalTariffComponent,
        WorkPoolContainerMedicalComponent,
        WorkPoolFilterMedicalComponent,
        EmployeeWorkPoolMedicalComponent,
        TebaInvoiceCaptureDetailsComponent,
        TebaInvoiceListComponent,        
        WizardMediHolisticViewComponent,
        PersonEventViewComponent
    ],
    exports: [
        InvoiceSwitchBatchConditionalIconsPipe,
        MedicalTariffComponent,
        ViewMedicalTariffComponent,        
        WizardMediHolisticViewComponent,
        MedicareViewResultsGenericActionMenu,
        PersonEventViewComponent,
        TebaInvoiceListComponent,
        ViewSearchResultsComponent
    ],
    providers: [
        SharedServicesLibModule,
        DatePipe,
        MediCareService,
        HealthcareProviderService,
        MediCarePreAuthService,
        CrosswalkSearchComponentService,
        DataShareService,
        UrlService
    ],
    bootstrap: [],
})

export class MediManagerModule {
    constructor(componentFactoryResolver: ComponentFactoryResolver, contextFactory: WizardContextFactory) {
        contextFactory.addWizardContext(new TebaInvoiceWizardContext(componentFactoryResolver), 'capture-teba-invoice');
        contextFactory.addWizardContext(new TebaInvoiceWizardContext(componentFactoryResolver), 'teba-invoices-pend-reject-process');
    }
}
