import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { ProductOptionDetailComponent } from '../views/product-option-details/product-option-detail.component';
import { ProductOptionNotesComponent } from '../views/product-option-notes/product-option-notes.component';
import { ProductOptionBenefitsComponent } from '../views/product-option-benefits/product-option-benefits.component';
import { ProductOptionRulesComponent } from '../views/product-option-rules/product-option-rules.component';
import { ProductOption } from '../models/product-option';
import { ProductOptionDocumentsComponent } from '../views/product-option-documents/product-option-documents.component';
import { ProductOptionSettingsWizardComponent } from '../views/product-option-settings-wizard/product-option-settings-wizard.component';

@Injectable({
  providedIn: 'root'
})
export class ProductOptionWizard extends WizardContext {
  backLink = 'clientcare/product-manager';
  breadcrumbModule = 'Product Manager';
  breadcrumbTitle = 'Product Option';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);

    // Add Wizard Components for this wizard
    this.wizardComponents.push(new WizardComponentStep(0, 'Details', ProductOptionDetailComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Configuration', ProductOptionSettingsWizardComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Rules', ProductOptionRulesComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Benefits', ProductOptionBenefitsComponent));
    this.wizardComponents.push(new WizardComponentStep(4, 'Notes', ProductOptionNotesComponent));
    this.wizardComponents.push(new WizardComponentStep(5, 'Documents', ProductOptionDocumentsComponent));
  }

  onApprovalRequested(): void { }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];

    const product = this.data[0] as ProductOption;
    if (product.id === 0) {
        this.breadcrumbTitle = 'Add a Product Option';
    } else {
        this.breadcrumbTitle = 'Edit a Product Option';
    }
  }
}
