import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { RMARMLMaintainPolicyComponent } from './maintain-wizard-steps/rma-rml-maintain-policy/rma-rml-maintain-policy.component';
import { RMARMLMaintainPolicyDeclarationWizardComponent } from './maintain-wizard-steps/policy-details/rma-rml-maintain-policy-declaration-wizard.component';
import { Policy } from '../../../shared/entities/policy';

@Injectable({
  providedIn: 'root'
})

export class RMARMLMaintainPolicyWizard extends WizardContext {
  backLink = '/clientcare/policy-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Policy Details', RMARMLMaintainPolicyComponent)); 
    this.wizardComponents.push(new WizardComponentStep(1, 'Declarations', RMARMLMaintainPolicyDeclarationWizardComponent)); 
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const data = this.data[0] as Policy;
    this.backLink = `/clientcare/member-manager/member-wholistic-view/${data.policyOwnerId}/1/${data.policyId}`;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
