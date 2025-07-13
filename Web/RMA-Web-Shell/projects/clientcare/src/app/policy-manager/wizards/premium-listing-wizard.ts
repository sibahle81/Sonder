import { Injectable, ComponentFactoryResolver } from '@angular/core';

import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';

import { PremiumListing } from '../shared/entities/premium-listing';
import { PremiumListingComponent } from '../views/premium-listing/premium-listing.component';
import { PremiumListingMembersComponent } from '../views/premium-listing-members/premium-listing-members.component';

@Injectable({
  providedIn: 'root'
})
export class PremiumListingWizard extends WizardContext {
  backLink = 'clientcare/policy-manager';
  decline = 'clientcare/policy-manager/new-business';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Premium Listing Summary', PremiumListingComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Policy Members', PremiumListingMembersComponent));
  }

  formatData(): void {
    this.data = JSON.parse(this.wizard.data);
    const testData = this.data[0] as PremiumListing;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
