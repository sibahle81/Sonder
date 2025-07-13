import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { TermsArrangementCaptureComponent } from '../views/terms-arrangement-capture/terms-arrangement-capture.component';

@Injectable({
  providedIn: 'root'
})

export class TermsArrangementWizard extends WizardContext {
    backLink = 'fincare/billing-manager';
    decline = 'fincare/billing-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Capture', TermsArrangementCaptureComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const data = this.data[0] as Policy[];
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
