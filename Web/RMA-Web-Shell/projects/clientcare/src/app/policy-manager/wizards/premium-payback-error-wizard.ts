import { Injectable, ComponentFactoryResolver } from '@angular/core';

import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';

import { PremiumPaybackListComponent } from 'projects/shared-components-lib/src/lib/premium-payback-list/premium-payback-list.component';
import { PremiumPaybackCase } from 'projects/shared-models-lib/src/lib/policy/premium-payback-case';

@Injectable({
  providedIn: 'root'
})
export class PremiumPaybackErrorWizard extends WizardContext {
  backLink = 'clientcare/policy-manager';
  decline = 'clientcare/policy-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Premium Payback Errors', PremiumPaybackListComponent));
  }

  formatData(): void {
    this.data = JSON.parse(this.wizard.data);
    const testData = this.data[0] as PremiumPaybackCase;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
