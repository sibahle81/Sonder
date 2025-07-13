import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { DeclarationAssistanceWizardComponent } from '../views/renewals/declaration-assistance-wizard/declaration-assistance-wizard.component';

@Injectable({
  providedIn: 'root'
})
export class DeclarationAssistanceWizard extends WizardContext {
  backLink = '/clientcare/member-manager';
  decline = '/clientcare/member-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Declarations', DeclarationAssistanceWizardComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    this.wizard.currentStepIndex = 1;
    this.wizard.currentStep = 'Step 1';
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
