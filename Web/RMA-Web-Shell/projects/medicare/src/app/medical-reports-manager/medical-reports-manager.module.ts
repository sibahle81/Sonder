import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalReportManagerRoutingModule } from './medical-report-manager-routing.module'
import { MedicalReportLayoutComponent } from './views/medical-report-layout/medical-report-layout.component';
import { MedicalReportHomeComponent } from './views/medical-report-home/medical-report-home.component';
import { MedicalReportsManagerComponent } from './views/medical-reports-manager/medical-reports-manager.component';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { MedicalReportViewComponent } from './views/medical-report-holistic/medical-report-view.component';
import { ReportClaimantDetailsComponent } from './views/medical-report-holistic/report-claimant-details/report-claimant-details.component';
import { ReportDiagnosisComponent } from './views/medical-report-holistic/report-diagnosis/report-diagnosis.component';
import { ReportDeclarationComponent } from './views/medical-report-holistic/report-declaration/report-declaration.component';
import { FirstDiseaseReportComponent } from './views/medical-report-holistic/first-disease-report/first-disease-report.component';
import { FirstDiseaseOccupationImpactReportComponent } from './views/medical-report-holistic/first-disease-occupation-impact-report/first-disease-occupation-impact-report.component';
import { FirstDiseasePtsdReportComponent } from './views/medical-report-holistic/first-disease-ptsd-report/first-disease-ptsd-report.component';
import { ProgressDiseaseReportComponent } from './views/medical-report-holistic/progress-disease-report/progress-disease-report.component';
import { FinalDiseaseReportComponent } from './views/medical-report-holistic/final-disease-report/final-disease-report.component';
import { FirstAccidentReportComponent } from './views/medical-report-holistic/first-accident-report/first-accident-report.component';
import { ProgressAccidentReportComponent } from './views/medical-report-holistic/progress-accident-report/progress-accident-report.component';
import { FinalAccidentReportComponent } from './views/medical-report-holistic/final-accident-report/final-accident-report.component';
import { EyeInjuryReportComponent } from './views/medical-report-holistic/eye-injury-report/eye-injury-report.component';
import { HomeVisitReportComponent } from './views/medical-report-holistic/home-visit-report/home-visit-report.component';
import { PhysioTherapyReportComponent } from './views/medical-report-holistic/physio-therapy-report/physio-therapy-report.component';
import { PmpMedHistoryReportComponent } from './views/medical-report-holistic/pmp-med-history-report/pmp-med-history-report.component';
import { ProstheticReviewReportComponent } from './views/medical-report-holistic/prosthetic-review-report/prosthetic-review-report.component';
import { RadiologyReportComponent } from './views/medical-report-holistic/radiology-report/radiology-report.component';
import { UrologicalReviewReportComponent } from './views/medical-report-holistic/urological-review-report/urological-review-report.component';
import { RejectMedicalReportDialogComponent } from './views/medical-report-holistic/reject-medical-report-dialog/reject-medical-report-dialog.component';


@NgModule({
  declarations: [
    MedicalReportLayoutComponent,
    MedicalReportHomeComponent,
    MedicalReportViewComponent,
    MedicalReportsManagerComponent,
    ReportClaimantDetailsComponent,
    ReportDiagnosisComponent,
    ReportDeclarationComponent,
    FirstDiseaseReportComponent,
    FirstDiseaseOccupationImpactReportComponent,
    FirstDiseasePtsdReportComponent,
    ProgressDiseaseReportComponent,
    FinalDiseaseReportComponent,
    FirstAccidentReportComponent,
    ProgressAccidentReportComponent,
    FinalAccidentReportComponent,
    EyeInjuryReportComponent,
    HomeVisitReportComponent,
    PhysioTherapyReportComponent,
    PmpMedHistoryReportComponent,
    ProstheticReviewReportComponent,
    RadiologyReportComponent,
    UrologicalReviewReportComponent,
    RejectMedicalReportDialogComponent
  ],
  imports: [
    MedicalReportManagerRoutingModule,
    SharedComponentsLibModule,
    CommonModule
  ]
})
export class MedicalReportsManagerModule { }
