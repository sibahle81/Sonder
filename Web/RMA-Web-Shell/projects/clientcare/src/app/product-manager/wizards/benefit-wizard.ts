import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { BenefitDetailsComponent } from '../views/benefit-details/benefit-details.component';
import { BenefitNotesComponent } from '../views/benefit-notes/benefit-notes.component';
import { BenefitRulesComponent } from '../views/benefit-rules/benefit-rules.component';
import { Benefit } from '../models/benefit';
import { BenefitDocumentsComponent } from '../views/benefit-documents/benefit-documents.component';

@Injectable({
  providedIn: 'root'
})
export class BenefitWizard extends WizardContext {
  backLink = 'clientcare/product-manager/benefit-list';
  breadcrumbModule = 'Product Manager';
  breadcrumbTitle = 'Product Option';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);

    // Add Wizard Components for this wizard
    this.wizardComponents.push(new WizardComponentStep(0, 'Detail', BenefitDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Rules', BenefitRulesComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Notes', BenefitNotesComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Documents', BenefitDocumentsComponent));
  }

  onApprovalRequested(): void { }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];

    const product = this.data[0] as Benefit;
    if (product.id === 0) {
      this.breadcrumbTitle = 'Add a Benefit';
    } else {
      this.breadcrumbTitle = 'Edit a Benefit';
    }
  }
}
