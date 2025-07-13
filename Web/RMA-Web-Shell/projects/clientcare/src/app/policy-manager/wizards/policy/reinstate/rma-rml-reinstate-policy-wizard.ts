import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { PolicyStatusChangeAudit } from '../../../shared/entities/policy-status-change-audit';
import { RMARMLDeclarationComponent } from './reinstate-wizard-steps/rma-rml-declaration/rma-rml-declaration.component';
import { RMARMLReinstatePolicyComponent } from './reinstate-wizard-steps/rma-rml-reinstate-policy/rma-rml-reinstate-policy.component';

@Injectable({
  providedIn: 'root'
})

export class RMARMLReinstatePolicyWizard extends WizardContext {
  backLink = '/clientcare/policy-manager';
  decline = '/clientcare/policy-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Reinstate Details', RMARMLReinstatePolicyComponent)); 
    this.wizardComponents.push(new WizardComponentStep(1, 'Declarations', RMARMLDeclarationComponent)); 
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
