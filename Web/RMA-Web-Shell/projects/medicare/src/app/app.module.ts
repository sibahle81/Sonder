
import { NgModule } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';
import { MediCareMainRoutingModule } from './app-routing.module';
import { MediManagerModule } from './medi-manager/medi-manager.module';
import { PreAuthManagerModule } from './preauth-manager/preauth-manager.module';
import { PreAuthManagerRoutingModule } from 'projects/medicare/src/app/preauth-manager/preauth-manager-routing.module';
import { MedicalInvoiceManagerRoutingModule } from './medical-invoice-manager/medical-invoice-manager-routing.module';
import { MedicalInvoiceManagerModule } from './medical-invoice-manager/medical-invoice-manager.module';
import { TreatmentPreauthModule } from './preauth-treatment-manager/treatment-preauth.module';
import { ChronicPreauthModule } from './preauth-chronic-manager/chronic-preauth.module';
import { HCPMemberManagerModule } from './healthcareprovider-register-manager/hcp-member-manager/hcp-member-manager.module';
import { HospitalVisitManagerModule } from 'projects/medicare/src/app/hospital-visit-manager/hospital-visit-manager.module';

import { PayeeTypeService } from 'projects/shared-services-lib/src/lib/services/payee-type/payee-type.service';

import { TimePickerComponent } from 'projects/medicare/src/app/shared/time-picker/date-time-picker.component';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { MedicareSearchMenusComponent } from './shared/components/medicare-search-menus/medicare-search-menus.component';
import { SearchMedicalInvoiceComponent } from './shared/components/search-medical-invoice/search-medical-invoice.component';
import { MedicareNotificationsComponent } from './shared/components/medicare-notifications/medicare-notifications.component';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { MedicarePersonSearchComponent } from './shared/components/medicare-person-search/medicare-person-search.component';
import { ClientCareSharedModule } from 'projects/clientcare/src/app/shared/clientcare.shared.module';
import { GenericModalMaterialComponentComponent } from './shared/components/generic-modal-material-component/generic-modal-material-component.component';
import { ClaimCareSharedModule } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/claim-care-shared.module';
import { MedicareClaimSearchComponent } from './shared/components/medicare-claimsearch/medicare-claimsearch.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { PMPManagerModule } from './pmp-manager/pmp-manager.module';
import { MedicalInvoiceBreakdownDetailsComponent } from './shared/components/medical-invoice-breakdown-details/medical-invoice-breakdown-details.component';
import { MedicalInvoiceListComponent } from './medical-invoice-manager/views/medical-invoice-list/medical-invoice-list.component';
import { MedicareWorkpoolSlaReportComponent } from './shared/components/medicare-workpool-sla-report/medicare-workpool-sla-report.component';

@NgModule({
    declarations: [
        TimePickerComponent,
        SearchMedicalInvoiceComponent,
        MedicareNotificationsComponent,
        MedicarePersonSearchComponent,
        GenericModalMaterialComponentComponent,
        MedicareClaimSearchComponent,
        MedicareWorkpoolSlaReportComponent,
    ],
    imports: [
        MaterialsModule,
        FrameworkModule,
        MediManagerModule,
        MediCareMainRoutingModule,
        PreAuthManagerModule,
        PreAuthManagerRoutingModule,
        MedicalInvoiceManagerRoutingModule,
        MedicalInvoiceManagerModule,
        HospitalVisitManagerModule,
        SharedComponentsLibModule,
        HCPMemberManagerModule,
        TreatmentPreauthModule,
        ChronicPreauthModule,
        PMPManagerModule,
        ClientCareSharedModule,
        ClaimCareSharedModule,
        WizardModule,
        SharedModule,
        //--Standalone components
        MedicareSearchMenusComponent,
        MedicalInvoiceBreakdownDetailsComponent,
        MedicalInvoiceListComponent
    ],
    exports: [],
    entryComponents: [
        TimePickerComponent,
        GenericModalMaterialComponentComponent
    ],
    providers: [
        PayeeTypeService
    ],
    bootstrap: []
})
export class MediCareMainAppModule { }

