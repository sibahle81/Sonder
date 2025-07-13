import { Injectable, ComponentFactoryResolver } from '@angular/core';

import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { BeneficiaryListComponent } from '../views/beneficiary-list/beneficiary-list.component';
import { RoleplayerGroupPolicy } from '../shared/entities/role-player-group-policy';
import { ExtendedFamilyListComponent } from '../views/extended-family-list/extended-family-list.component';
import { GroupPolicyCompanyComponent } from '../views/group-policy-company/group-policy-company.component';
import { GroupPolicyMainMemberComponent } from '../views/group-policy-main-member/group-policy-main-member.component';
import { PolicyContactDetailsComponent } from '../views/policy-contact-details/policy-contact-details.component';
import { SpouseChildrenListComponent } from '../views/spouse-children-list/spouse-children-list.component';
import { RolePlayerPolicyNotesComponent } from '../views/role-player-policy-notes/role-player-policy-notes.component';

@Injectable({
    providedIn: 'root'
})
export class GroupPolicyMemberWizard extends WizardContext {
    backLink = 'clientcare/policy-manager';
    decline = 'clientcare/policy-manager/new-business';

    constructor(componentFactoryResolver: ComponentFactoryResolver) {
        super(componentFactoryResolver);
        this.wizardComponents.push(new WizardComponentStep(0, 'Company', GroupPolicyCompanyComponent, false));
        this.wizardComponents.push(new WizardComponentStep(1, 'Main Member', GroupPolicyMainMemberComponent, false));
        this.wizardComponents.push(new WizardComponentStep(2, 'Contact Details', PolicyContactDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(3, 'Spouse & Children', SpouseChildrenListComponent));
        this.wizardComponents.push(new WizardComponentStep(4, 'Extended Family', ExtendedFamilyListComponent));
        this.wizardComponents.push(new WizardComponentStep(5, 'Beneficiaries', BeneficiaryListComponent));
        this.wizardComponents.push(new WizardComponentStep(6, 'Notes', RolePlayerPolicyNotesComponent, false, false, true));
    }

    formatData(): void {
        const arrayData: any[] = JSON.parse(this.wizard.data);
        this.data[0] = arrayData[0];
        const caseTest = this.data[0] as RoleplayerGroupPolicy;
    }

    onApprovalRequested(): void { }

    setComponentPermissions(component: any) {
        component.addPermission = this.addPermission;
        component.editPermission = this.editPermission;
        component.viewPermission = this.viewPermission;
    }
}
