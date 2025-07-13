import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { IndustryClassDeclarationConfigurationWizardComponent } from '../views/renewals/industry-class-declaration-configuration-wizard/industry-class-declaration-configuration-wizard.component';
import { IndustryClassDeclarationConfiguration } from '../models/industry-class-declaration-configuration';

@Injectable({
  providedIn: 'root'
})
export class IndustryClassDeclarationConfigurationWizard extends WizardContext {
  backLink = '/clientcare/member-manager';
  decline = '/clientcare/member-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Industry Class Declaration Configuration', IndustryClassDeclarationConfigurationWizardComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const industryClassDeclarationConfigurations = this.data[0] as IndustryClassDeclarationConfiguration[];
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
