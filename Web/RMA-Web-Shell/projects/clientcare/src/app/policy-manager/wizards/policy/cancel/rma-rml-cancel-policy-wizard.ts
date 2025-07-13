import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { RMARMLCancelPolicyComponent } from './cancel-wizard-steps/rma-rml-cancel-policy/rma-rml-cancel-policy.component';
import { PolicyStatusChangeAudit } from '../../../shared/entities/policy-status-change-audit';
import { RMARMLCancelPolicySummaryComponent } from './cancel-wizard-steps/rma-rml-cancel-policy-summary/rma-rml-cancel-policy-summary.component';

@Injectable({
  providedIn: 'root'
})

export class RMARMLCancelPolicyWizard extends WizardContext {
  backLink = '/clientcare/policy-manager';
  decline = '/clientcare/policy-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Cancel Details', RMARMLCancelPolicyComponent)); 
    this.wizardComponents.push(new WizardComponentStep(1, 'Summary', RMARMLCancelPolicySummaryComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const data = this.data[0] as PolicyStatusChangeAudit;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
