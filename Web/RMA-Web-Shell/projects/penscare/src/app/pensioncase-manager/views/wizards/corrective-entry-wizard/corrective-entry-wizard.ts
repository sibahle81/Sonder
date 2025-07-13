import { ComponentFactoryResolver, Injectable } from "@angular/core";
import { WizardComponentStep } from "projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step";
import { WizardContext } from "projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context";
import { CorrectiveEntryDetailsComponent } from "./corrective-entry-details/corrective-entry-details.component";
import { CorrectiveEntryLedgerDetailComponent } from "./corrective-entry-ledger-detail/corrective-entry-ledger-detail.component";
import { CorrectiveEntrySplitComponent } from "./corrective-entry-split/corrective-entry-split.component";

@Injectable({
  providedIn: 'root'
})

export class CorrectiveEntryWizard extends WizardContext {
  backLink = 'penscare/pensioncase-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Pension Ledger Detail', CorrectiveEntryLedgerDetailComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Corrective Entry Detail', CorrectiveEntryDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Corrective Entry Split', CorrectiveEntrySplitComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }

  onApprovalRequested(): void { }
}
