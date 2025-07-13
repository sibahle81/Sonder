import { ComponentFactoryResolver } from '@angular/core';

import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';

import { MedicalReportFormDiagnosisComponent } from 'projects/marketingcare/src/app/marketing-manager/views/shared/medical-report-form-diagnosis/medical-report-form-diagnosis.component';
import { ClaimSearchComponent } from 'projects/marketingcare/src/app/marketing-manager/views/shared/claim-search/claim-search.component';
import { MedicalReportFormDeclarationComponent } from 'projects/marketingcare/src/app/marketing-manager/views/shared/medical-report-form-declaration/medical-report-form-declaration.component';

import { FirstDiseaseReportDetailsComponent } from 'projects/marketingcare/src/app/work-manager/views/wizards/first-medical-report/first-disease-report-details/first-disease-report-details.component';
import { FirstDiseaseReportPtsdDetailsComponent } from 'projects/marketingcare/src/app/work-manager/views/wizards/first-medical-report/first-disease-report-ptsd-details/first-disease-report-ptsd-details.component';
import { FirstDiseaseReportOccupationImpactDetailsComponent} from 'projects/marketingcare/src/app/work-manager/views/wizards/first-medical-report/first-disease-report-occupation-impact-details/first-disease-report-occupation-impact-details.component';

export class FirstDiseaseMedicalReportFormWizardContext extends WizardContext {
  backLink = 'marketingcare/work-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', ClaimSearchComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Capture & confirm diagnosis', MedicalReportFormDiagnosisComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Capture clinical details', FirstDiseaseReportDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Capture occupational impact details', FirstDiseaseReportOccupationImpactDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Capture post traumatic stress disorder details', FirstDiseaseReportPtsdDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Declaration', MedicalReportFormDeclarationComponent));
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
