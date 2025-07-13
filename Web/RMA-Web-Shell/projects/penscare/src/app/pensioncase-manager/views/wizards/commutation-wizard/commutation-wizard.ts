import { ComponentFactoryResolver, Injectable } from "@angular/core";
import { WizardComponentStep } from "projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step";
import { WizardContext } from "projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context";
import { CommutationWizardComponent } from "./commutation-wizard.component";

@Injectable({
  providedIn: 'root'
})

export class CommutationWizardContext extends WizardContext {
  backLink = 'penscare/pensioncase-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Commutation Application', CommutationWizardComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }

  onApprovalRequested(): void { }
}
