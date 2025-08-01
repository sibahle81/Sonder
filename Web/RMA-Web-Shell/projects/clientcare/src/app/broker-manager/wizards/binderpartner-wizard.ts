import { Injectable, ComponentFactoryResolver } from '@angular/core';

import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';

import { BrokerageDetailsComponent } from '../views/brokerage-details/brokerage-details.component';
import { BrokerageProductOptionsComponent } from '../views/brokerage-product-options/brokerage-product-options.component';
import { BrokerageContactDetailsComponent } from '../views/brokerage-contact-details/brokerage-contact-details.component';
import { BrokerageBankingDetailsComponent } from '../views/brokerage-banking-details/brokerage-banking-details.component';
import { BrokerageConsultantComponent } from '../views/brokerage-consultant/brokerage-consultant.component';
import { BrokerageNotesComponent } from '../views/brokerage-notes/brokerage-notes.component';
import { Brokerage } from '../models/brokerage';
import { BrokerageAddressListComponent } from '../views/brokerage-address-list/brokerage-address-list.component';
import { BrokerageCategoriesListComponent } from '../views/brokerage-categories-list/brokerage-categories-list.component';
import { BrokerageDocumentsComponent } from '../views/brokerage-documents/brokerage-documents.component';
import { BrokerageChecksComponent } from '../views/brokerage-checks/brokerage-checks.component';
import { ProductOptionConfigurationComponent } from '../views/product-option-configuration/product-option-configuration.component';

@Injectable()
export class BinderPartnerWizard extends WizardContext {
  backLink = 'clientcare/broker-manager/brokerage-list';

  breadcrumbModule = 'Binder Partner Manager';
  breadcrumbTitle = 'Binder Partner';

  editPermission = 'Edit BinderPartner';
  viewPermission = 'View BinderPartner';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Binder Partner Details', BrokerageDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Banking Details', BrokerageBankingDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Contact Details', BrokerageContactDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Address Details', BrokerageAddressListComponent));
    this.wizardComponents.push(new WizardComponentStep(4, 'Categories', BrokerageCategoriesListComponent));
    this.wizardComponents.push(new WizardComponentStep(5, 'RMA Consultants', BrokerageConsultantComponent));
    this.wizardComponents.push(new WizardComponentStep(6, 'Contract Options', BrokerageProductOptionsComponent));
    this.wizardComponents.push(new WizardComponentStep(7, 'Configuration', ProductOptionConfigurationComponent));
    this.wizardComponents.push(new WizardComponentStep(8, 'Documents', BrokerageDocumentsComponent));
    this.wizardComponents.push(new WizardComponentStep(9, 'Binder Partner Checks', BrokerageChecksComponent, true));
    this.wizardComponents.push(new WizardComponentStep(10, 'Notes', BrokerageNotesComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];

    const brokerage = this.data[0] as Brokerage;
    if (brokerage.id === 0) {
      this.breadcrumbTitle = 'Add a Binder Partner';
    } else {
      this.breadcrumbTitle = 'Edit a Binder Partner';
    }
  }
  onApprovalRequested(): void { }
  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
