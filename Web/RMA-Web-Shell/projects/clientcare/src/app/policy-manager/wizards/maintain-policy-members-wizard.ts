import { Injectable, ComponentFactoryResolver } from '@angular/core';

import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { Case } from '../shared/entities/case';
import { VerifyCaseComponent } from '../views/verify-case/verify-case.component';
import { RolePlayerPolicyNotesComponent } from '../views/role-player-policy-notes/role-player-policy-notes.component';
import { SpouseChildrenListComponent } from '../views/spouse-children-list/spouse-children-list.component';
import { ExtendedFamilyListComponent } from '../views/extended-family-list/extended-family-list.component';
import { MainMemberPolicyListComponent } from '../views/main-member-policy-list/main-member-policy-list.component';
import { MainMemberPersonComponent } from '../views/main-member-person/main-member-person.component';

@Injectable({
  providedIn: 'root'
})
export class PolicyMembersWizard extends WizardContext {

  backLink = 'clientcare/policy-manager';
  decline = 'clientcare/policy-manager/new-business';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Verify Case', VerifyCaseComponent, false, true));
    this.wizardComponents.push(new WizardComponentStep(1, 'Main Member', MainMemberPersonComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Policies', MainMemberPolicyListComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Spouse & Children', SpouseChildrenListComponent));
    this.wizardComponents.push(new WizardComponentStep(4, 'Extended Family', ExtendedFamilyListComponent));
    this.wizardComponents.push(new WizardComponentStep(5, 'Notes', RolePlayerPolicyNotesComponent, false, false, true));
  }

  onApprovalRequested(): void { }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const caseTest = this.data[0] as Case;
  }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
