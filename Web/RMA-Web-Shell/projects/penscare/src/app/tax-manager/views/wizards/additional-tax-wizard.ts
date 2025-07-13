import { ComponentFactoryResolver } from "@angular/core";
import { AdditionalTaxWizardComponent } from "./additional-tax-wizard/additional-tax-wizard.component";
import { WizardContext } from "projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context";
import { WizardComponentStep } from "projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step";

export class AdditionalTaxWizardContext extends WizardContext {
  backLink = '/penscare/tax-manager/manage-tax';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Additional Tax', AdditionalTaxWizardComponent));
  }

  onApprovalRequested(): void { }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }
}
