import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { ClaimantRecoveryReasonComponent } from './claimant-recovery-reason/claimant-recovery-reason.component';
import { ClaimantRecoveryDocumentComponent } from './claimant-recovery-document/claimant-recovery-document.component';
import { ClaimantRecoveryModel } from '../../shared/entities/funeral/claimant-recovery-model';
import { ClaimantRecoveryBeneficiaryComponent } from './claimant-recovery-beneficiary/claimant-recovery-beneficiary.component';

@Injectable({
  providedIn: 'root'
})

export class ClaimantRecoveryWizard extends WizardContext {
  backLink = 'claimcare/claim-manager/claim-workpool';

  breadcrumbModule = 'Claimant Recovery';
  breadcrumbTitle = 'Claimant Recovery';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Beneficiary Details', ClaimantRecoveryBeneficiaryComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Reason and Notes', ClaimantRecoveryReasonComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Claimant Recovery Document', ClaimantRecoveryDocumentComponent));
  }

  onApprovalRequested(): void {}

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const claimantRecovery = this.data[0] as ClaimantRecoveryModel;
  }
}
