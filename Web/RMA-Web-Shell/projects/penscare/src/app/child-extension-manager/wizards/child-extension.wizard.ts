import { ComponentFactoryResolver, OnInit } from '@angular/core';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ChildExtensionBeneficiaryComponent } from './child-extension-wizard/child-extension-beneficiary/child-extension-beneficiary.component';
import { ChildExtensionDocumentsComponent } from './child-extension-wizard/child-extension-documents/child-extension-documents.component';
import { ChildExtensionNotesComponent } from './child-extension-wizard/child-extension-notes/child-extension-notes.component';
import { ChildExtensionRecipientComponent } from './child-extension-wizard/child-extension-recipient/child-extension-recipient.component';

export class ChildExtensionWizardContext extends WizardContext {
  backLink = '/penscare/child-extension-manager/manage-child-extension';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Particulars Of Child', ChildExtensionBeneficiaryComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Particulars Of Recipient', ChildExtensionRecipientComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Documents', ChildExtensionDocumentsComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Notes', ChildExtensionNotesComponent));
  }

  onApprovalRequested(): void { }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }
}



