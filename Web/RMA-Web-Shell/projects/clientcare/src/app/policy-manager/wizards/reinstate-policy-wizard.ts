import { Injectable, ComponentFactoryResolver } from '@angular/core';

import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { SpouseChildrenListComponent } from '../views/spouse-children-list/spouse-children-list.component';
import { ExtendedFamilyListComponent } from '../views/extended-family-list/extended-family-list.component';
import { VerifyCaseComponent } from '../views/verify-case/verify-case.component';
import { PolicyContactDetailsComponent } from '../views/policy-contact-details/policy-contact-details.component';
import { Case } from '../shared/entities/case';
import { MainMemberDetailsComponent } from '../views/main-member-details/main-member-details.component';
import { RolePlayerPolicyNotesComponent } from '../views/role-player-policy-notes/role-player-policy-notes.component';
import { PolicySummaryComponent } from '../views/policy-summary/policy-summary.component';
import { PolicyScheduleComponent } from '../views/policy-schedule/policy-schedule.component';
import { PolicyCollectionDetailsComponent } from '../views/policy-collection-details/policy-collection-details.component';
import { BeneficiaryListComponent } from '../views/beneficiary-list/beneficiary-list.component';
import { ContinueOutstandingPremiumsComponent } from '../views/continue-outstanding-premiums/continue-outstanding-premiums.component';


@Injectable({
  providedIn: 'root'
})
export class ReinstatePolicyIndividualWizard extends WizardContext {
  backLink = 'clientcare/policy-manager';
  decline = 'clientcare/policy-manager/new-business';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Verify Case', VerifyCaseComponent, false, true));
    this.wizardComponents.push(new WizardComponentStep(1, 'Main Member', MainMemberDetailsComponent, false, true));
    this.wizardComponents.push(new WizardComponentStep(2, 'Outstanding Premiums', ContinueOutstandingPremiumsComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Spouse & Children', SpouseChildrenListComponent));
    this.wizardComponents.push(new WizardComponentStep(4, 'Extended Family', ExtendedFamilyListComponent));
    this.wizardComponents.push(new WizardComponentStep(5, 'Beneficiaries', BeneficiaryListComponent));
    this.wizardComponents.push(new WizardComponentStep(6, 'Premium Calculation', PolicySummaryComponent));
    this.wizardComponents.push(new WizardComponentStep(7, 'Contact Details', PolicyContactDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(8, 'Collection Details', PolicyCollectionDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(9, 'Notes', RolePlayerPolicyNotesComponent, false, false, true));
    this.wizardComponents.push(new WizardComponentStep(10, 'Policy Schedule', PolicyScheduleComponent, false)); 
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const caseTest = this.data[0] as Case;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
