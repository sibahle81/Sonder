import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { PensionLedgerStatusNotesComponent } from './pension-ledger-status-notes/pension-ledger-status-notes.component';
import { PensionLedgerStatusComponent } from './pension-ledger-status/pension-ledger-status.component';
@Injectable({
  providedIn: 'root'
})

export class PensionLedgerStatusWizard extends WizardContext {
  backLink = 'penscare/pensioncase-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Pension Ledger', PensionLedgerStatusComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Notes', PensionLedgerStatusNotesComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }

  onApprovalRequested(): void { }
}
