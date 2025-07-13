import { ComponentFactoryResolver, OnInit } from '@angular/core';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { TaxItemsListComponent } from './tax-rates-wizard/tax-items-list/tax-items-list.component';
import { TaxRateNotesComponent } from './tax-rates-wizard/tax-rate-notes/tax-rate-notes.component';

export class TaxRatesFormWizardContext extends WizardContext {
  backLink = '/penscare/tax-manager/manage-tax';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Tax rates', TaxItemsListComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Notes', TaxRateNotesComponent));
  }

  onApprovalRequested(): void { }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }
}
