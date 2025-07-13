import { Injectable, ComponentFactoryResolver } from "@angular/core";
import { WizardComponentStep } from "projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step";
import { WizardContext } from "projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context";
import { AnnualIncreaseWizardComponent } from "./annual-increase-wizard/annual-increase-wizard.component";

@Injectable({
  providedIn: 'root'
})

export class AnnualIncreaseWizardContext extends WizardContext {
  backLink = 'penscare/annual-increase';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Annual Increase Application', AnnualIncreaseWizardComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }

  onApprovalRequested(): void { }
}
