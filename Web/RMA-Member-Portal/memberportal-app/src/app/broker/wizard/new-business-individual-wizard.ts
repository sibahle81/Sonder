import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardComponentStep } from 'src/app/shared/components/wizard/sdk/wizard-component-step';
import { WizardContext } from 'src/app/shared/components/wizard/shared/models/wizard-context';
import { Case } from 'src/app/shared/models/case';
import { BeneficiaryListComponent } from '../beneficiary-list/beneficiary-list.component';
import { ExtendedFamilyListComponent } from '../extended-family-list/extended-family-list.component';
import { MainMemberDetailsComponent } from '../main-member-details/main-member-details.component';
import { PolicyCollectionDetailsComponent } from '../policy-collection-details/policy-collection-details.component';
import { PolicyContactDetailsComponent } from '../policy-contact-details/policy-contact-details.component';
import { PolicyScheduleComponent } from '../policy-schedule/policy-schedule.component';
import { PolicySummaryComponent } from '../policy-summary/policy-summary.component';
import { RolePlayerPolicyNotesComponent } from '../role-player-policy-notes/role-player-policy-notes.component';
import { SpouseChildrenListComponent } from '../spouse-children-list/spouse-children-list.component';
import { VerifyCaseComponent } from '../verify-case/verify-case.component';

@Injectable({
  providedIn: 'root'
})
export class NewBusinessIndividualWizard extends WizardContext {
  backLink = 'case-list';
  decline = 'case-list';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Verify Case', VerifyCaseComponent, false, true));
    this.wizardComponents.push(new WizardComponentStep(1, 'Main Member', MainMemberDetailsComponent, false, true));
    this.wizardComponents.push(new WizardComponentStep(2, 'Contact Details', PolicyContactDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Spouse & Children', SpouseChildrenListComponent));
    this.wizardComponents.push(new WizardComponentStep(4, 'Extended Family', ExtendedFamilyListComponent));
    this.wizardComponents.push(new WizardComponentStep(5, 'Beneficiaries', BeneficiaryListComponent));
    this.wizardComponents.push(new WizardComponentStep(6, 'Premium Calculation', PolicySummaryComponent));
    this.wizardComponents.push(new WizardComponentStep(7, 'Collection Details', PolicyCollectionDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(8, 'Notes', RolePlayerPolicyNotesComponent, false, false, true));
    this.wizardComponents.push(new WizardComponentStep(9, 'Policy Documents', PolicyScheduleComponent));
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
