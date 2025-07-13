import { Injectable, ComponentFactoryResolver } from '@angular/core';

import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';

import { PolicyNotesComponent } from '../views/policy-notes/policy-notes.component';
import { ChildPolicySelectionComponent } from '../views/child-policy-selection/child-policy-selection.component';
import { GroupPolicySchemeSourceComponent } from '../views/group-policy-scheme-source/group-policy-scheme-source.component';
import { GroupPolicySchemeTargetComponent } from '../views/group-policy-scheme-target/group-policy-scheme-target.component';

@Injectable({
  providedIn: 'root'
})
export class MovePolicySchemeWizard extends WizardContext {
  backLink = 'clientcare/policy-manager';
  decline = 'clientcare/policy-manager/new-business';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Source Scheme', GroupPolicySchemeSourceComponent, false, false));
    this.wizardComponents.push(new WizardComponentStep(1, 'Target Scheme', GroupPolicySchemeTargetComponent, false, false));
    this.wizardComponents.push(new WizardComponentStep(2, 'Move Policies', ChildPolicySelectionComponent, false, false));
    this.wizardComponents.push(new WizardComponentStep(3, 'Notes', PolicyNotesComponent, false, false, true));
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
