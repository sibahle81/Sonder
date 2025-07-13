import { Injectable, ComponentFactoryResolver } from '@angular/core';

import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';

import { RolePlayerPolicyNotesComponent } from '../views/role-player-policy-notes/role-player-policy-notes.component';
import { LapsePolicyViewComponent } from '../views/lapse-policy-view/lapse-policy-view.component';
import { VerifyCaseComponent } from '../views/verify-case/verify-case.component';
import { Case } from '../shared/entities/case';

@Injectable({
  providedIn: 'root'
})
export class LapsePolicyWizard extends WizardContext {
  backLink = 'clientcare/policy-manager';
  decline = 'clientcare/policy-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Verify Case', VerifyCaseComponent, false, true));
    this.wizardComponents.push(new WizardComponentStep(1, 'Main Member', LapsePolicyViewComponent, false, true));
    this.wizardComponents.push(new WizardComponentStep(2, 'Notes', RolePlayerPolicyNotesComponent, false, false, true));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const caseTest = this.data[0] as Case;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
