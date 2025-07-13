import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { ClaimBankAccountComponent } from './claim-bank-account/claim-bank-account.component';
import { ClaimRolePlayerBankingModel } from '../../shared/entities/claim-beneficiary-banking-model';

@Injectable({
  providedIn: 'root'
})

export class CreateBankingDetailsWizard extends WizardContext {

  backLink = 'claimcare/claim-manager/claim-workpool';
  breadcrumbModule = 'Role Player Banking Details';
  breadcrumbTitle = 'Create Banking Details';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Create Banking Details', ClaimBankAccountComponent));
  }

  onApprovalRequested(): void {}

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const claimBeneficiaryBanking = this.data[0] as ClaimRolePlayerBankingModel;
  }
}
