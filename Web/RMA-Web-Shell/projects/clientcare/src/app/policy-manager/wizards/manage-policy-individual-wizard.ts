import { Injectable, ComponentFactoryResolver } from '@angular/core';

import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { SpouseChildrenListComponent } from '../views/spouse-children-list/spouse-children-list.component';
import { ExtendedFamilyListComponent } from '../views/extended-family-list/extended-family-list.component';
import { VerifyCaseComponent } from '../views/verify-case/verify-case.component';
import { PolicyChildContactDetailsComponent } from '../views/policy-child-contact-details/policy-child-contact-details.component';
import { Case } from '../shared/entities/case';
import { MainMemberDetailsComponent } from '../views/main-member-details/main-member-details.component';
import { RolePlayerPolicyNotesComponent } from '../views/role-player-policy-notes/role-player-policy-notes.component';
import { PolicySummaryComponent } from '../views/policy-summary/policy-summary.component';
import { PolicyScheduleComponent } from '../views/policy-schedule/policy-schedule.component';
import { PolicyCollectionDetailsComponent } from '../views/policy-collection-details/policy-collection-details.component';
import { BeneficiaryListComponent } from '../views/beneficiary-list/beneficiary-list.component';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { InsurerEnum } from 'projects/shared-components-lib/src/lib/wizard/shared/models/insurer.enum';
import { PolicyAmendmentsComponent } from '../views/policy-amendments/policy-amendments.component';

@Injectable({
  providedIn: 'root'
})
export class ManagePolicyIndividualWizard extends WizardContext {
  backLink = 'clientcare/policy-manager';
  decline = 'clientcare/policy-manager/new-business';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Verify Case', VerifyCaseComponent, false, true));
    this.wizardComponents.push(new WizardComponentStep(1, 'Main Member', MainMemberDetailsComponent, false, true));
    this.wizardComponents.push(new WizardComponentStep(2, 'Spouse & Children', SpouseChildrenListComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Extended Family', ExtendedFamilyListComponent));
    this.wizardComponents.push(new WizardComponentStep(4, 'Beneficiaries', BeneficiaryListComponent));
    this.wizardComponents.push(new WizardComponentStep(5, 'Premium Calculation', PolicySummaryComponent));
    this.wizardComponents.push(new WizardComponentStep(6, 'Contact Details', PolicyChildContactDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(7, 'Collection Details', PolicyCollectionDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(8, 'Notes', RolePlayerPolicyNotesComponent, false, false, true));
    this.wizardComponents.push(new WizardComponentStep(9, 'Policy Schedule', PolicyScheduleComponent, false)); // TO DO: CHANGE THIS TO "TRUE" as this should be sent on approval
    this.wizardComponents.push(new WizardComponentStep(10, 'Letters', PolicyAmendmentsComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const testCase = this.data[0] as Case;
    if (testCase.mainMember && testCase.mainMember.policies && testCase.mainMember.policies.length > 0) {
      const policy = testCase.mainMember.policies[0];
      if (policy.insurerId === InsurerEnum.NimbleFinancialServices && this.wizard.wizardStatusId !== WizardStatus.Completed) {
        this.wizard.wizardStatusId = WizardStatus.Completed;
      }
    }
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
