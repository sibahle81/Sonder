import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { ProductDetailsComponent } from '../views/product-details/product-details.component';
import { ProductNotesComponent } from '../views/product-notes/product-notes.component';
import { ProductRulesComponent } from '../views/product-rules/product-rules.component';
import { Product } from '../models/product';
import { ProductDocumentsComponent } from '../views/product-documents/product-documents.component';
import { ProductSummaryComponent } from '../views/product-summary/product-summary.component';

@Injectable()
export class ProductWizard extends WizardContext {
    backLink = 'clientcare/product-manager';
    breadcrumbModule = 'Product Manager';
    breadcrumbTitle = 'Product';

    addPermission = 'Add Product';
    editPermission = 'Edit Product';
    viewPermission = 'View Product';

    constructor(componentFactoryResolver: ComponentFactoryResolver) {
        super(componentFactoryResolver);

        // Add Wizard Components Here
        this.wizardComponents.push(new WizardComponentStep(0, 'Details', ProductDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Rules', ProductRulesComponent));
        this.wizardComponents.push(new WizardComponentStep(2, 'Notes', ProductNotesComponent));
        this.wizardComponents.push(new WizardComponentStep(3, 'Documents', ProductDocumentsComponent));
        // this.wizardComponents.push(new WizardComponentStep(3, 'Summary', ProductSummaryComponent));
    }

    formatData(): void {
        const arrayData: any[] = JSON.parse(this.wizard.data);
        this.data[0] = arrayData[0];

        const product = this.data[0] as Product;
        if (product.id === 0) {
            this.breadcrumbTitle = 'Add a Product';
        } else {
            this.breadcrumbTitle = 'Edit a Product';
        }
    }

    onApprovalRequested(): void { }

    setComponentPermissions(component: any) {
        component.addPermission = this.addPermission;
        component.editPermission = this.editPermission;
        component.viewPermission = this.viewPermission;
    }
}
