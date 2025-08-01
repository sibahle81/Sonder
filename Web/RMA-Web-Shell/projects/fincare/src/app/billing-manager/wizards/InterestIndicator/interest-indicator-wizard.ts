import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { InterestIndicatorWizardStepComponent } from './steps/interest-indicator-wizard-step/interest-indicator-wizard-step.component';

@Injectable({
  providedIn: 'root'
})

export class InterestIndicatorWizard extends WizardContext  {
  forceApproveRejectOptions = true;
  backLink = 'fincare/billing-manager';
  decline = 'fincare/billing-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Interest indicator', InterestIndicatorWizardStepComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}