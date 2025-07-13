import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { RepresentativeDetailsComponent } from '../views/representative-details/representative-details.component';
import { RepresentativeAddressComponent } from '../views/representative-address/representative-address.component';
import { RepresentativeBrokerageLinkComponent } from '../views/representative-brokerage-link/representative-brokerage-link.component';
import { RepresentativeAuthorisedRepresentativeComponent } from '../views/representative-authorised-representative/representative-authorised-representative.component';
import { RepresentativeChecksComponent } from '../views/representative-checks/representative-checks.component';
import { RepresentativeDocumentsComponent } from '../views/representative-documents/representative-documents.component';
import { RepresentativeNotesComponent } from '../views/representative-notes/representative-notes.component';
import { Representative } from '../models/representative';
import { RepresentativeBankingDetailsComponent } from '../views/representative-banking-details/representative-banking-details.component';

@Injectable()
export class RepresentativeWizard extends WizardContext {
  backLink = 'clientcare/broker-manager/broker-list';
  
  breadcrumbModule = 'Brokerage Manager';
  breadcrumbTitle = 'Broker';

  addPermission = 'Add Representative';
  editPermission = 'Edit Representative';
  viewPermission = 'View Representative';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Representative Details', RepresentativeDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Banking Details', RepresentativeBankingDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Address Details', RepresentativeAddressComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Brokerage Details', RepresentativeBrokerageLinkComponent));
    this.wizardComponents.push(new WizardComponentStep(4, 'Authorised Representatives', RepresentativeAuthorisedRepresentativeComponent));
    this.wizardComponents.push(new WizardComponentStep(5, 'Representative Checks', RepresentativeChecksComponent));
    this.wizardComponents.push(new WizardComponentStep(6, 'Documents', RepresentativeDocumentsComponent));
    this.wizardComponents.push(new WizardComponentStep(7, 'Notes', RepresentativeNotesComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];

    const representative = this.data[0] as Representative;
    if (representative.id === 0) {
      this.breadcrumbTitle = 'Add a Representative';
    } else {
      this.breadcrumbTitle = 'Edit a Representative';
    }
  }
  onApprovalRequested(): void { }
  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}