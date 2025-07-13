import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardComponentStep } from 'src/app/shared/components/wizard/sdk/wizard-component-step';
import { WizardContext } from 'src/app/shared/components/wizard/shared/models/wizard-context';
import { Case } from 'src/app/shared/models/case';
import { GroupMemberDetailsComponent } from '../group-members-details/group-member-details.component';
import { PolicyCollectionDetailsComponent } from '../policy-collection-details/policy-collection-details.component';
import { PolicyContactDetailsComponent } from '../policy-contact-details/policy-contact-details.component';
import { PolicyMemberDocumentsComponent } from '../policy-member-documents/policy-member-documents.component';
import { RolePlayerPolicyNotesComponent } from '../role-player-policy-notes/role-player-policy-notes.component';
import { VerifyCaseComponent } from '../verify-case/verify-case.component';


@Injectable({
    providedIn: 'root'
})
export class NewBusinessGroupWizard extends WizardContext {
    backLink = 'case-list';
    decline = 'case-list';

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
