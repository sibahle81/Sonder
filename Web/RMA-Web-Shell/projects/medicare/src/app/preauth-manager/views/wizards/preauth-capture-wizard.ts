import { ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { PreAuthClaimSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-claim-search/preauth-claim-search.component';
import { MedicalReportFormDiagnosisComponent } from 'projects/digicare/src/app/digi-manager/views/shared/medical-report-form-diagnosis/medical-report-form-diagnosis.component';
import { PreAuthorisation } from '../../models/preauthorisation';

export class PreAuthCaptureWizardContext extends WizardContext {
  backLink = 'medicare/preauth-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    //this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', PreAuthClaimSearchComponent));
    //this.wizardComponents.push(new WizardComponentStep(1, 'Capture & confirm diagnosis', MedicalReportFormDiagnosisComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0] as PreAuthorisation;
    if (this.data[0]?.personEventId > 0 && this.data[0]?.claimId > 0)
      this.backLink = `/medicare/view-search-results/${this.data[0].personEventId}/holisticview/${this.data[0].claimId}`;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }

}
