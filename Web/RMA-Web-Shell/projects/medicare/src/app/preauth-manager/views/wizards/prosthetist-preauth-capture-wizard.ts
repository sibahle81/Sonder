import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component';
import { PreAuthClaimSearchComponent } from '../../../medi-manager/views/shared/preauth-claim-search/preauth-claim-search.component';
import { PreAuthCaptureComponent } from '../../../preauth-manager/views/wizards/preauth-capture/preauth-capture.component';
import { PreAuthDiagnosisComponent } from '../../../medi-manager/views/shared/preauth-diagnosis/preauth-diagnosis.component';
import { PreauthBreakdownComponent } from '../../../medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';
import { PreAuthorisation } from '../../models/preauthorisation';

@Injectable({
    providedIn: 'root'
  })
  
export class ProsthetistPreauthCaptureWizard extends WizardContext  {
  backLink = 'medicare/work-manager';
  
  constructor(componentFactoryResolver: ComponentFactoryResolver){
    super(componentFactoryResolver);
    this.captureTreatmentPreauthWizard();
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0] as PreAuthorisation;
    if (this.data[0]?.personEventId > 0 && this.data[0]?.claimId > 0)
      this.backLink = `/medicare/view-search-results/${this.data[0].personEventId}/holisticview/${this.data[0].claimId}`;
  }

  onApprovalRequested(): void { }

  captureTreatmentPreauthWizard() {
    this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', PreAuthClaimSearchComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Health care provider', HealthCareProviderSearchComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Capture authorisation details', PreAuthCaptureComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Capture ICD10 codes', PreAuthDiagnosisComponent));
    this.wizardComponents.push(new WizardComponentStep(4, 'Preauthorisation breakdown', PreauthBreakdownComponent));
  }

}
