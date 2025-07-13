import { DatePipe } from '@angular/common';
import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/public-api';
import { SharedModule } from 'src/app/shared/shared.module';;
import { DigiCareMasterDataService } from './services/digicare-master-data.service';
import { DigiCareService } from './services/digicare.service';
import { DigiManagerRoutingModule } from './digi-manager-routing.module';
import { MedicalReportFormDeclarationComponent } from './Views/shared/medical-report-form-declaration/medical-report-form-declaration.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EyeInjuryReportComponent } from './Views/shared/eye-injury-report/eye-injury-report.component';
import { UrologicalReviewReportComponent } from './Views/shared/urological-review-report/urological-review-report.component';
import { ClaimMedicalFormDocumentsComponent } from './Views/shared/claim-medical-form-documents/claim-medical-form-documents.component';
import { DigiCareLayoutComponent } from './Views/digicare-layout/digicare-layout.component';
import { DigiHomeComponent } from './Views/digi-home/digi-home.component';
import { PhysioTherapyDetailsComponent } from './Views/shared/physio-therapy-details/physio-therapy-details.component';

import { RadiologyReportComponent } from './Views/shared/radiology-report/radiology-report.component';
import { PmpMedHistoryComponent } from './Views/shared/pmp-med-history/pmp-med-history.component';
import { HomeVisitReportComponent } from './Views/shared/home-visit-report/home-visit-report.component';
import { ProstheticReviewReportComponent } from './Views/shared/prosthetic-review-report/prosthetic-review-report.component';

@NgModule({
    imports: [
        FrameworkModule,
        DigiManagerRoutingModule,
        SharedModule,
        MatTooltipModule
    ],
    declarations: [
        DigiHomeComponent,
        DigiCareLayoutComponent,
        MedicalReportFormDeclarationComponent,
        EyeInjuryReportComponent,
        ClaimMedicalFormDocumentsComponent,
        UrologicalReviewReportComponent,
        PmpMedHistoryComponent,
        HomeVisitReportComponent,
        PhysioTherapyDetailsComponent,
        RadiologyReportComponent,
        ProstheticReviewReportComponent
    ],
    exports: [
        ClaimMedicalFormDocumentsComponent,
        EyeInjuryReportComponent
    ],


    providers: [
        SharedServicesLibModule,
        DatePipe,
        DigiCareService,
        DigiCareMasterDataService
    ],
    bootstrap: [],
})
export class DigiManagerModule {
    constructor(componentFactoryResolver: ComponentFactoryResolver) {
    }
}
