import { ComponentFactoryResolver, Injectable } from "@angular/core";
import { ConsolidatedFuneralMembersComponent } from "projects/clientcare/src/app/policy-manager/views/consolidated-funeral-members/consolidated-funeral-members.component";
import { ConsolidatedFuneralSummaryComponent } from "projects/clientcare/src/app/policy-manager/views/consolidated-funeral-summary/consolidated-funeral-summary.component";

import { WizardComponentStep } from "projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step";
import { WizardContext } from "projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context";

@Injectable({
  providedIn: 'root'
})

export class ConsolidatedFuneralUploadWizard extends WizardContext {
  backLink = 'member/onboarding-manager/home';
  decline = 'member/onboarding-manager/home';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Member Summary', ConsolidatedFuneralSummaryComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Member VOPD Status', ConsolidatedFuneralMembersComponent));
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