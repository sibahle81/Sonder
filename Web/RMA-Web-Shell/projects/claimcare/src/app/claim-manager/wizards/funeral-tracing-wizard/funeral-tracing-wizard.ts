import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { ClaimRolePlayerBankingModel } from '../../shared/entities/claim-beneficiary-banking-model';
import { ClaimTracerComponent } from './claim-tracer/claim-tracer.component';
import { ClaimBankAccountComponent } from '../banking-details-wizard/claim-bank-account/claim-bank-account.component';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

@Injectable({
  providedIn: 'root'
})

export class FuneralTracingWizard extends WizardContext {
  claimId = 0;
  backLink: string;

  breadcrumbModule = 'Create Tracer';
  breadcrumbTitle = 'Funeral';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Tracer Details', ClaimTracerComponent));
  }

  onApprovalRequested(): void {}

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const claimBeneficiaryBanking = this.data[0] as RolePlayer;
    this.claimId = this.wizard.linkedItemId;
    this.backLink = `claimcare/claim-manager/funeral/add-beneficiary-banking-details/${this.claimId}`;
  }
}
