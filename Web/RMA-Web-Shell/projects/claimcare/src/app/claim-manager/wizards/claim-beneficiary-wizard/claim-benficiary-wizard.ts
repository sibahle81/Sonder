import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { ClaimBeneficiaryComponent } from './claim-beneficiary/claim-beneficiary.component';
import { ClaimRolePlayerBankingModel } from '../../shared/entities/claim-beneficiary-banking-model';

@Injectable({
  providedIn: 'root'
})

export class ClaimBeneficiaryBankingWizard extends WizardContext {
  backLink = 'claimcare/claim-manager/claim-workpool';

  breadcrumbModule = 'Create Beneficiary';
  breadcrumbTitle = 'Funeral';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Beneficiary Details', ClaimBeneficiaryComponent));
  }

  onApprovalRequested(): void {}

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const claimBeneficiaryBanking = this.data[0] as ClaimRolePlayerBankingModel;
  }
}
