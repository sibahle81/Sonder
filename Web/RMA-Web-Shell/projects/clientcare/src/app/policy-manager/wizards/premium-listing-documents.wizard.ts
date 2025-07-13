import { Injectable, ComponentFactoryResolver } from '@angular/core';

import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';

import { PremiumListing } from '../shared/entities/premium-listing';
import { PremiumListingDocumentsGroupComponent } from '../views/premium-listing-documents-group/premium-listing-documents-group.component';
import { PremiumListingDocumentsMemberComponent } from '../views/premium-listing-documents-member/premium-listing-documents-member.component';
import { PremiumListingDocumentSelectionComponent } from '../views/premium-listing-document-selection/premium-listing-document-selection.component';

@Injectable({
    providedIn: 'root'
})
export class PremiumListingDocumentsWizard extends WizardContext {
    backLink = 'clientcare/policy-manager';
    decline = 'clientcare/policy-manager/new-business';

    constructor(componentFactoryResolver: ComponentFactoryResolver) {
        super(componentFactoryResolver);
        this.wizardComponents.push(new WizardComponentStep(0, 'Policy Notifications', PremiumListingDocumentSelectionComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Group Documents', PremiumListingDocumentsGroupComponent));
        this.wizardComponents.push(new WizardComponentStep(2, 'Membership Certificates', PremiumListingDocumentsMemberComponent));
    }

    formatData(): void {
        const wizardData = JSON.parse(this.wizard.data);
        const testData = wizardData[0] as PremiumListing;
        this.data[0] = testData;
    }

    onApprovalRequested(): void { }

    setComponentPermissions(component: any) {
        component.addPermission = this.addPermission;
        component.editPermission = this.editPermission;
        component.viewPermission = this.viewPermission;
    }
}
