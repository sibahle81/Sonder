import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { PensionCaseDetailsComponent } from './pension-case-details/pension-case-details.component';
import { PensionLedgerComponent } from './pension-ledger/pension-ledger.component';
import { PensionNotesComponent } from './pension-notes/pension-notes.component';
import { ClaimInformationComponent } from './claim-information/claim-information.component';
import { RecipientInformationComponent } from './recipient-information/recipient-information.component';
import { BeneficiaryInformationComponent } from './beneficiary-information/beneficiary-information.component';
import { PensionerInformationComponent } from './pensioner-information/pensioner-information.component';
import { AccountInformationListComponent } from './account-information-list/account-information-list.component';
import { PensionCaseDocumentsComponent } from './pension-case-documents/pension-case-documents.component';
import { VerifyCvComponent } from './verify-cv/verify-cv.component';
import { ClaimInformationListComponent } from './claim-information/claim-information-list/claim-information-list.component';

@Injectable({
  providedIn: 'root'
})

export class InitiatePensionCaseWizard extends WizardContext {
  backLink = 'penscare/pensioncase-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Pension Case', PensionCaseDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Claims', ClaimInformationListComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Pensioner', PensionerInformationComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Recipients', RecipientInformationComponent ));
    this.wizardComponents.push(new WizardComponentStep(4, 'Beneficiaries', BeneficiaryInformationComponent));
    this.wizardComponents.push(new WizardComponentStep(5, 'Banking detail', AccountInformationListComponent));
    this.wizardComponents.push(new WizardComponentStep(6, 'Verify CV calculation', VerifyCvComponent));
    this.wizardComponents.push(new WizardComponentStep(7, 'Pension Ledger', PensionLedgerComponent));
    this.wizardComponents.push(new WizardComponentStep(8, 'Documents', PensionCaseDocumentsComponent));
    this.wizardComponents.push(new WizardComponentStep(9, 'Notes', PensionNotesComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }

  onApprovalRequested(): void { }
}
