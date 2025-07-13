
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { NgModule } from '@angular/core';
import { HospitalVisitManagerRoutingModule } from 'projects/medicare/src/app/hospital-visit-manager/hospital-visit-manager-routing.module';
import { ListHospitalVisitComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/list-hospital-visit/list-hospital-visit.component';
import { CaptureHospitalVisitComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/capture-hospital-visit/capture-hospital-visit.component';
import { PreAuthManagerModule } from 'projects/medicare/src/app/preauth-manager/preauth-manager.module';
import { ClinicalUpdateService } from 'projects/medicare/src/app/hospital-visit-manager/services/hospital-visit.service';
import { MatTreeModule } from '@angular/material/tree';
import { ReviewHospitalVisitComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/review-hospital-visit/review-hospital-visit.component';
import { PreAuthBreakDownsComponent } from 'projects/medicare/src/app/preauth-manager/views/helpers/components/preauth-breakdowns/preauth-breakdowns.component';
import { PreAuthICD10CodesComponent } from 'projects/medicare/src/app/preauth-manager/views/helpers/components/pre-auth-icd10-codes/preauth-icd10-codes.component';
import { MediManagerModule } from 'projects/medicare/src/app/medi-manager/medi-manager.module';
import { ClinicalUpdateReviewComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/clinical-update-review/clinical-update-review.component';
import { PreauthIcd10EditComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-icd10-edit/preauth-icd10-edit.component';
import { ViewHospitalVisitComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/view-hospital-visit/view-hospital-visit.component';
import { ClinicalUpdateBreakdownViewComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/clinical-update-breakdown-view/clinical-update-breakdown-view.component';
import { EditHospitalVisitComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/edit-hospital-visit/edit-hospital-visit.component';
import { MedicareSearchMenusComponent } from '../shared/components/medicare-search-menus/medicare-search-menus.component';
import { MedicalInvoiceBreakdownDetailsComponent } from '../shared/components/medical-invoice-breakdown-details/medical-invoice-breakdown-details.component';
import { MedicalInvoiceListComponent } from '../medical-invoice-manager/views/medical-invoice-list/medical-invoice-list.component';
import { MedicalInvoiceLineUnderAssessReasonColorPipe } from '../medical-invoice-manager/pipes/medical-invoice-line-under-assess-reason-color.pipe';
import { UnderAssessReasonsViewerComponent } from '../shared/components/under-assess-reasons-viewer/under-assess-reasons-viewer.component';
import { MedicalInvoiceStatusColorPipe } from '../medical-invoice-manager/pipes/medical-invoice-status-color.pipe';
import { MedicalInvoiceTotalsCalculationsPipe } from '../medical-invoice-manager/pipes/medical-invoice-totals-calculations.pipe';
import { MedicalInvoiceValidationsPipe } from '../medical-invoice-manager/pipes/medical-invoice-validations.pipe';
import { SwitchBatchInvoiceStatusColorPipe } from '../medical-invoice-manager/pipes/switch-batch-invoice-status-color.pipe';

@NgModule({
    declarations: [ListHospitalVisitComponent, CaptureHospitalVisitComponent, ViewHospitalVisitComponent,
        ClinicalUpdateBreakdownViewComponent, ReviewHospitalVisitComponent, ClinicalUpdateReviewComponent, EditHospitalVisitComponent],
    imports: [
        CommonModule,
        MaterialsModule,
        HospitalVisitManagerRoutingModule,
        PreAuthManagerModule,
        MediManagerModule,
        MatTreeModule,
        //--Standalone components
        MedicalInvoiceLineUnderAssessReasonColorPipe,
        MedicalInvoiceStatusColorPipe,
        MedicalInvoiceTotalsCalculationsPipe,
        MedicalInvoiceValidationsPipe,
        SwitchBatchInvoiceStatusColorPipe,
        MedicareSearchMenusComponent,
        UnderAssessReasonsViewerComponent,
        MedicalInvoiceBreakdownDetailsComponent,
        MedicalInvoiceListComponent
    ],
    entryComponents: [
        PreAuthBreakDownsComponent,
        PreAuthICD10CodesComponent,
        PreauthIcd10EditComponent
    ],
    providers: [
        ClinicalUpdateService
    ]
})
export class HospitalVisitManagerModule { }
