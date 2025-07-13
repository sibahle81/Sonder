import { ComponentFactoryResolver, Injectable } from '@angular/core';

import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';

import { ConsolidatedFuneralSummaryComponent } from '../views/consolidated-funeral-summary/consolidated-funeral-summary.component';
import { ConsolidatedFuneralMembersComponent } from '../views/consolidated-funeral-members/consolidated-funeral-members.component';

@Injectable({
  providedIn: 'root'
})

export class ConsolidatedFuneralWizard extends WizardContext {
  backLink = 'clientcare/policy-manager';
  decline = 'clientcare/policy-manager/new-business';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Consolidated Funeral Summary', ConsolidatedFuneralSummaryComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Member VOPD Status', ConsolidatedFuneralMembersComponent));
  }

  formatData(): void {
    let data = this.wizard.data;
    // Some completely blank values have been found:
    data = data.replace(': ,', ': null,');
    const arrayData: any[] = JSON.parse(data);
    this.data[0] = arrayData[0];
  }
 
  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}