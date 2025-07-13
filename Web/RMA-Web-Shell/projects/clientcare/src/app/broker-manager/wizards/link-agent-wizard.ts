import { Injectable, ComponentFactoryResolver } from '@angular/core';

import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';

import { RepresentativeLookupComponent } from '../views/representative-lookup/representative-lookup.component';
import { RepresentativeBrokerageLinkComponent } from '../views/representative-brokerage-link/representative-brokerage-link.component';
import { RepresentativeDocumentsComponent } from '../views/representative-documents/representative-documents.component';
import { RepresentativeChecksComponent } from '../views/representative-checks/representative-checks.component';
import { RepresentativeNotesComponent } from '../views/representative-notes/representative-notes.component';
import { RepresentativeBankingDetailsComponent } from '../views/representative-banking-details/representative-banking-details.component';

@Injectable()
export class LinkAgentWizard extends WizardContext {
  backLink = 'clientcare/broker-manager';

  constructor(
    componentFactoryResolver: ComponentFactoryResolver
  ) {
    super(componentFactoryResolver);

    // Add Wizard Components here
    this.wizardComponents.push(new WizardComponentStep(0, 'Select Agent', RepresentativeLookupComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Link Brokerage', RepresentativeBrokerageLinkComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Documents', RepresentativeDocumentsComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Representative Checks', RepresentativeChecksComponent, true));
    this.wizardComponents.push(new WizardComponentStep(4, 'Notes', RepresentativeNotesComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }

  onApprovalRequested(): void { }
}
