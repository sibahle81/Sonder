import { Injectable, ComponentFactoryResolver } from "@angular/core";
import { WizardComponentStep } from "projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step";
import { WizardContext } from "projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context";
import { OverpaymentWizardComponent } from "./overpayment-wizard/overpayment-wizard.component";

@Injectable({
  providedIn: 'root'
})

export class OverPaymentWizardContext extends WizardContext {
  backLink = 'penscare/overpayments';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Overpayment Application', OverpaymentWizardComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }

  onApprovalRequested(): void { }
}
