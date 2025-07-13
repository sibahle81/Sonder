import { Injectable, ComponentFactoryResolver } from '@angular/core';

import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';

import { GroupSchemeProductOptionComponent } from '../views/group-scheme-product-option/group-scheme-product-option.component';
import { GroupSchemeChildPoliciesComponent } from '../views/group-scheme-child-policies/group-scheme-child-policies.component';
import { GroupSchemeBenefitsComponent } from '../views/group-scheme-benefits/group-scheme-benefits.component';
import { ViewGroupPolicyComponent } from '../views/view-group-policy/view-group-policy.component';
import { PolicyNotesComponent } from '../views/policy-notes/policy-notes.component';

@Injectable({
    providedIn: 'root'
})
export class UpgradeDownGradePolicyWizard
    extends WizardContext {
    backLink = 'clientcare/policy-manager';
    decline = 'clientcare/policy-manager/new-business';

    constructor(componentFactoryResolver: ComponentFactoryResolver) {
        super(componentFactoryResolver);
        this.wizardComponents.push(new WizardComponentStep(0, 'Policy', ViewGroupPolicyComponent, false, false));
        this.wizardComponents.push(new WizardComponentStep(1, 'Product Option', GroupSchemeProductOptionComponent, false, false));
        this.wizardComponents.push(new WizardComponentStep(1, 'Child Policies', GroupSchemeChildPoliciesComponent, false, false));
        this.wizardComponents.push(new WizardComponentStep(3, 'Benefits', GroupSchemeBenefitsComponent, false, false));
        this.wizardComponents.push(new WizardComponentStep(4, 'Notes', PolicyNotesComponent, false, false, true));
    }

    formatData(): void {
        let data = this.wizard.data;
        // Some complete blank values have been found:
        data = data.replace(': ,', ': null,');
        const arrayData: any[] = JSON.parse(data);
        this.data[0] = arrayData[0];
    }

    onApprovalRequested(): void { }

    setComponentPermissions(component: any) {
        component.addPermission = this.addPermission;
        component.editPermission = this.editPermission;
        component.viewPermission = this.viewPermission;
    }
}
