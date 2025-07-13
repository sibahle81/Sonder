import { ComponentFactoryResolver } from '@angular/core';

import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';

import { MedicalReportFormDiagnosisComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/medical-report-form-diagnosis/medical-report-form-diagnosis.component';
import { ClaimSearchComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/claim-search/claim-search.component';
import { MedicalReportFormDeclarationComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/medical-report-form-declaration/medical-report-form-declaration.component';

import { FirstDiseaseReportDetailsComponent } from 'projects/digicare/src/app/work-manager/views/wizards/first-medical-report/first-disease-report-details/first-disease-report-details.component';
import { FirstDiseaseReportPtsdDetailsComponent } from 'projects/digicare/src/app/work-manager/views/wizards/first-medical-report/first-disease-report-ptsd-details/first-disease-report-ptsd-details.component';
import { FirstDiseaseReportOccupationImpactDetailsComponent } from 'projects/digicare/src/app/work-manager/views/wizards/first-medical-report/first-disease-report-occupation-impact-details/first-disease-report-occupation-impact-details.component';
import { MedicalReportCategoryEnum } from '../../../models/enum/medical-report-category.enum';
import { PhysioTherapyDetailsComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/physio-therapy-details/physio-therapy-details.component';
import { HomeVisitReportComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/home-visit-report/home-visit-report.component';
import { EyeInjuryReportComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/eye-injury-report/eye-injury-report.component';
import { PmpMedHistoryComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/pmp-med-history/pmp-med-history.component';
import { RadiologyReportComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/radiology-report/radiology-report.component';
import { UrologicalReviewReportComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/urological-review-report/urological-review-report.component';
import { ProstheticReviewReportComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/prosthetic-review-report/prosthetic-review-report.component';

export class FirstDiseaseMedicalReportFormWizardContext extends WizardContext {
  backLink = 'digicare/work-manager';
  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.loadReportCategoryTypeBasedOnSelection();
  }

  loadReportCategoryTypeBasedOnSelection() {
    let reportCategoryName = parseInt(sessionStorage.getItem('selectedReportCategoryType'));
    switch (reportCategoryName) {
      case MedicalReportCategoryEnum.PhysioTherapyReport:
        this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', ClaimSearchComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Capture & confirm diagnosis', MedicalReportFormDiagnosisComponent));
        this.wizardComponents.push(new WizardComponentStep(2, 'Capture clinical details', FirstDiseaseReportDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(3, 'Capture occupational impact details', FirstDiseaseReportOccupationImpactDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(4, 'Capture post traumatic stress disorder details', FirstDiseaseReportPtsdDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(5, 'Capture Physio Therapy Details', PhysioTherapyDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(6, 'Declaration', MedicalReportFormDeclarationComponent));
        break;
      case MedicalReportCategoryEnum.EyeInjuryReport:
        this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', ClaimSearchComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Capture & confirm diagnosis', MedicalReportFormDiagnosisComponent));
        this.wizardComponents.push(new WizardComponentStep(2, 'Capture clinical details', FirstDiseaseReportDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(3, 'Capture occupational impact details', FirstDiseaseReportOccupationImpactDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(4, 'Capture post traumatic stress disorder details', FirstDiseaseReportPtsdDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(5, 'Capture Eye Injury Report', EyeInjuryReportComponent));
        this.wizardComponents.push(new WizardComponentStep(6, 'Declaration', MedicalReportFormDeclarationComponent));
        break;
      case MedicalReportCategoryEnum.HomeVisit:
        this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', ClaimSearchComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Capture & confirm diagnosis', MedicalReportFormDiagnosisComponent));
        this.wizardComponents.push(new WizardComponentStep(2, 'Capture clinical details', FirstDiseaseReportDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(3, 'Capture occupational impact details', FirstDiseaseReportOccupationImpactDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(4, 'Capture post traumatic stress disorder details', FirstDiseaseReportPtsdDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(5, 'Capture Home Visit', HomeVisitReportComponent));
        this.wizardComponents.push(new WizardComponentStep(6, 'Declaration', MedicalReportFormDeclarationComponent));
        break;
      case MedicalReportCategoryEnum.PMPMedHistory:
        this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', ClaimSearchComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Capture & confirm diagnosis', MedicalReportFormDiagnosisComponent));
        this.wizardComponents.push(new WizardComponentStep(2, 'Capture clinical details', FirstDiseaseReportDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(3, 'Capture occupational impact details', FirstDiseaseReportOccupationImpactDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(4, 'Capture post traumatic stress disorder details', FirstDiseaseReportPtsdDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(5, 'Capture PMP Med History', PmpMedHistoryComponent));
        this.wizardComponents.push(new WizardComponentStep(6, 'Declaration', MedicalReportFormDeclarationComponent));
        break;
      case MedicalReportCategoryEnum.RadiologyReport:
        this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', ClaimSearchComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Capture & confirm diagnosis', MedicalReportFormDiagnosisComponent));
        this.wizardComponents.push(new WizardComponentStep(2, 'Capture clinical details', FirstDiseaseReportDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(3, 'Capture occupational impact details', FirstDiseaseReportOccupationImpactDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(4, 'Capture post traumatic stress disorder details', FirstDiseaseReportPtsdDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(5, 'Capture Radiology Report', RadiologyReportComponent));
        this.wizardComponents.push(new WizardComponentStep(6, 'Declaration', MedicalReportFormDeclarationComponent));
        break;
      case MedicalReportCategoryEnum.UrologicalReview:
        this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', ClaimSearchComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Capture & confirm diagnosis', MedicalReportFormDiagnosisComponent));
        this.wizardComponents.push(new WizardComponentStep(2, 'Capture clinical details', FirstDiseaseReportDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(3, 'Capture occupational impact details', FirstDiseaseReportOccupationImpactDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(4, 'Capture post traumatic stress disorder details', FirstDiseaseReportPtsdDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(5, 'Capture Urological Review', UrologicalReviewReportComponent));
        this.wizardComponents.push(new WizardComponentStep(6, 'Declaration', MedicalReportFormDeclarationComponent));
        break;
      case MedicalReportCategoryEnum.ProstheticReview:
        this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', ClaimSearchComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Capture & confirm diagnosis', MedicalReportFormDiagnosisComponent));
        this.wizardComponents.push(new WizardComponentStep(2, 'Capture clinical details', FirstDiseaseReportDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(3, 'Capture occupational impact details', FirstDiseaseReportOccupationImpactDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(4, 'Capture post traumatic stress disorder details', FirstDiseaseReportPtsdDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(5, 'Capture Prosthetic Review Report', ProstheticReviewReportComponent));
        this.wizardComponents.push(new WizardComponentStep(6, 'Declaration', MedicalReportFormDeclarationComponent));
        break;
      default:
        this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', ClaimSearchComponent));
    }

  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }

}
