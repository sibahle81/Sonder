import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';


@Injectable({
    providedIn: 'root'
  })
export class AgentWizard extends WizardContext {
  backLink = 'clientcare/broker-manager/broker-list';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    // this.wizardComponents.push(new WizardComponentStep(0, 'Agent', BrokerDetailsComponent));
  }

  onApprovalRequested(): void {}

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }
}
