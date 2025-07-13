import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { NewMemberApprovalComponent } from './new-member-approval/new-member-approval.component';
import { NewMemberClaimantComponent } from './new-member-claimant/new-member-claimant.component';

@Injectable({
  providedIn: 'root'
})

export class MemberApprovalWizard extends WizardContext {
  backLink = 'claimcare/claim-manager';
  // decline = 'clientcare/policy-manager/new-business';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Member Details', NewMemberApprovalComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Claimant Details', NewMemberClaimantComponent));
  }

  formatData(): void {
    // const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = JSON.parse(this.wizard.data);
    // var memberApproval = new MemberApproval();
    // memberApproval.person = this.data[0].person;
    // memberApproval.personEvent = this.data[0].person;
    console.log(this.data);

    // const testData = this.data[0] as MemberApproval;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
