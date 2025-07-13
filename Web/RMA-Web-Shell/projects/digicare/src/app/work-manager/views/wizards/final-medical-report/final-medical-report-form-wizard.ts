import { ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';


import { ClaimSearchComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/claim-search/claim-search.component';
import { FinalReportDetailsComponent } from 'projects/digicare/src/app/work-manager/views/wizards/final-medical-report/final-report-details/final-report-details.component';

import { MedicalReportFormDeclarationComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/medical-report-form-declaration/medical-report-form-declaration.component';
import { MedicalReportFormDiagnosisComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/medical-report-form-diagnosis/medical-report-form-diagnosis.component';

export class FinalMedicalReportFormWizardContext extends WizardContext {
  backLink = 'digicare/work-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', ClaimSearchComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Capture & confirm diagnosis', MedicalReportFormDiagnosisComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Capture final medical report details', FinalReportDetailsComponent));
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
