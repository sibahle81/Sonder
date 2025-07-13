import { ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { ClaimSearchComponent } from 'projects/debtcare/src/app/debt-manager/views/shared/claim-search/claim-search.component';
import { MedicalReportFormDeclarationComponent } from 'projects/debtcare/src/app/debt-manager/views/shared/medical-report-form-declaration/medical-report-form-declaration.component';
import { FirstReportDetailsComponent } from 'projects/debtcare/src/app/work-manager/views/wizards/first-medical-report/first-report-details/first-report-details.component';
import { MedicalReportFormDiagnosisComponent } from 'projects/debtcare/src/app/debt-manager/views/shared/medical-report-form-diagnosis/medical-report-form-diagnosis.component';

export class FirstMedicalReportFormWizardContext extends WizardContext {
  backLink = 'debtcare/work-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', ClaimSearchComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Capture & confirm diagnosis', MedicalReportFormDiagnosisComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Capture first medical report details', FirstReportDetailsComponent));
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
