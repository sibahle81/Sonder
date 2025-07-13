import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { GroupRiskEmployerDetailsComponent } from '../views/group-risk-employer-details/group-risk-employer-details.component';
import { GroupRiskCreatePoliciesComponent } from '../views/group-risk-create-policies/group-risk-create-policies.component';
import { GroupRiskNotesComponent } from '../views/group-risk-notes/group-risk-notes.component';
import { GroupRiskDocumentsComponent } from '../views/group-risk-documents/group-risk-documents.component';
import { GroupRiskCreatePolicyBenefitsComponent } from '../views/group-risk-create-policy-benefits/group-risk-create-policy-benefits.component';
import { GroupRiskCreateBenefitCategoriesComponent } from '../views/group-risk-create-benefit-categories/group-risk-create-benefit-categories.component';

@Injectable({
  providedIn: 'root'
})

export class ManageGroupRiskPoliciesWizard extends WizardContext {
  backLink = 'clientcare/policy-manager';
  decline = 'clientcare/policy-manager/new-business';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Employer Details', GroupRiskEmployerDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Policies', GroupRiskCreatePoliciesComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Policy Benefits', GroupRiskCreatePolicyBenefitsComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Benefit Categories', GroupRiskCreateBenefitCategoriesComponent));
    this.wizardComponents.push(new WizardComponentStep(4, 'Notes', GroupRiskNotesComponent));
    this.wizardComponents.push(new WizardComponentStep(5, 'Documents', GroupRiskDocumentsComponent));
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
