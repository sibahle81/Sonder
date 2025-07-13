import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { Case } from '../shared/entities/case';
import { RolePlayerPolicyNotesComponent } from '../views/role-player-policy-notes/role-player-policy-notes.component';
import { PolicyBankingDetailsComponent } from '../views/policy-banking-details/policy-banking-details.component';
import { VerifyCaseComponent } from '../views/verify-case/verify-case.component';
import { MainMemberCancellationComponent } from '../views/main-member-cancellation/main-member-cancellation.component';
import { PolicyAmendmentsComponent } from '../views/policy-amendments/policy-amendments.component';

@Injectable({
  providedIn: 'root'
})
export class CancelPolicyIndividualWizard extends WizardContext {
  backLink = 'clientcare/policy-manager';
  decline = 'clientcare/policy-manager/new-business';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Verify Case', VerifyCaseComponent, false, true));
    this.wizardComponents.push(new WizardComponentStep(1, 'Main Member', MainMemberCancellationComponent, false, true));
    this.wizardComponents.push(new WizardComponentStep(2, 'Banking Details', PolicyBankingDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Notes', RolePlayerPolicyNotesComponent, false, false, true));
    this.wizardComponents.push(new WizardComponentStep(4, 'Letters', PolicyAmendmentsComponent));
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
