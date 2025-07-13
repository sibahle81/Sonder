import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { VerifyCaseComponent } from '../views/verify-case/verify-case.component';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { Case } from '../shared/entities/case';
import { GroupMemberDetailsComponent } from '../views/group-members-details/group-member-details.component';
import { PolicyCollectionDetailsComponent } from '../views/policy-collection-details/policy-collection-details.component';
import { PolicyContactDetailsComponent } from '../views/policy-contact-details/policy-contact-details.component';
import { RolePlayerPolicyNotesComponent } from '../views/role-player-policy-notes/role-player-policy-notes.component';
import { PolicyMemberDocumentsComponent } from '../views/policy-member-documents/policy-member-documents.component';

@Injectable({
    providedIn: 'root'
})
export class NewBusinessGroupWizard extends WizardContext {
    backLink = 'clientcare/policy-manager';
    decline = 'clientcare/policy-manager/new-business';

    constructor(componentFactoryResolver: ComponentFactoryResolver) {
        super(componentFactoryResolver);
        this.wizardComponents.push(new WizardComponentStep(0, 'Verify Case', VerifyCaseComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Client Details', GroupMemberDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(2, 'Collection Details', PolicyCollectionDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(3, 'Contact Details', PolicyContactDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(4, 'Notes', RolePlayerPolicyNotesComponent));
        this.wizardComponents.push(new WizardComponentStep(5, 'Policy Documents', PolicyMemberDocumentsComponent, true));
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
