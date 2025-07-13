import { ComponentFactoryResolver, Injectable } from '@angular/core';

import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';

import { MyvalueplusSummaryComponent } from '../views/myvalueplus-summary/myvalueplus-summary.component';
import { MyvalueplusMembersComponent } from '../views/myvalueplus-members/myvalueplus-members.component';

@Injectable({
  providedIn: 'root'
})

export class MyValuePlusWizard extends WizardContext {
  backLink = 'clientcare/policy-manager';
  decline = 'clientcare/policy-manager/new-business';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'My Value Plus Summary', MyvalueplusSummaryComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Member VOPD Status', MyvalueplusMembersComponent));
  }

  formatData(): void {
    let data = this.wizard.data;
    // Some complete blank values have been found:
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