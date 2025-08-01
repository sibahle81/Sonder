import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { HealthcareProviderBankingDetailsComponent } from './steps/healthcare-provider-banking-details.component';


@Injectable({
  providedIn: 'root'
})
export class HealthcareProviderBankingDetailsWizard extends WizardContext {
  backLink = '/medicare/medicare-notifications';
  decline = '/medicare/medicare-notifications';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Update Healthcare Provider Banking Details', HealthcareProviderBankingDetailsComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const result = this.data[0] as RolePlayer;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
