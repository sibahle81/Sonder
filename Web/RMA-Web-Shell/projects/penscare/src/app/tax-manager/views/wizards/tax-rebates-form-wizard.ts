import { ComponentFactoryResolver, OnInit } from '@angular/core';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { TaxRebatesFormComponent } from './tax-rebates-wizard/tax-rebates-form/tax-rebates-form.component';
import { TaxRebatesNotesComponent } from './tax-rebates-wizard/tax-rebates-notes/tax-rebates-notes.component';

export class TaxRebatesFormWizardContext extends WizardContext {
  backLink = '/penscare/tax-manager/manage-tax';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Tax Rebates', TaxRebatesFormComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Notes', TaxRebatesNotesComponent));
  }

  onApprovalRequested(): void { }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }
}
