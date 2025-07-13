import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { RolePlayer } from '../../../policy-manager/shared/entities/roleplayer';
import { RolePlayerDetailsStepComponent } from './steps/role-player-details-step/role-player-details-step.component';
import { RolePlayerInformationComponent } from './steps/role-player-information/role-player-information.component';
import { RolePlayerContactsComponent } from './steps/role-player-contacts/role-player-contacts.component';
import { RolePlayerAddressComponent } from './steps/role-player-address/role-player-address.component';
import { RolePlayerBankAccountsComponent } from './steps/role-player-bank-accounts/role-player-bank-accounts.component';
import { RolePlayerNotesComponent } from './steps/role-player-notes/role-player-notes.component';
import { RolePlayerDocumentsComponent } from './steps/role-player-documents/role-player-documents.component';
@Injectable({
  providedIn: 'root'
})
export class RolePlayerOnboardingWizard extends WizardContext {
    backLink = '/clientcare/member-manager/member-wholistic-view/';
    decline = '/clientcare/member-manager';

    constructor(componentFactoryResolver: ComponentFactoryResolver) {
        super(componentFactoryResolver);
        this.wizardComponents.push(new WizardComponentStep(0, 'Role Player', RolePlayerInformationComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Contacts', RolePlayerContactsComponent));
        this.wizardComponents.push(new WizardComponentStep(2, 'Address', RolePlayerAddressComponent));
        this.wizardComponents.push(new WizardComponentStep(3, 'Bank Accounts', RolePlayerBankAccountsComponent));
        this.wizardComponents.push(new WizardComponentStep(4, 'Notes', RolePlayerNotesComponent));
        this.wizardComponents.push(new WizardComponentStep(5, 'Documents', RolePlayerDocumentsComponent));
    }

    formatData(): void {
        const arrayData: any[] = JSON.parse(this.wizard.data);
        this.backLink += this.wizard.id
        this.data[0] = arrayData[0];
        const rolePlayer = this.data[0] as RolePlayer;
        this.wizard.currentStepIndex = 1;
        this.wizard.currentStep = 'Step 1';
    }

    onApprovalRequested(): void { }

    setComponentPermissions(component: any) {
        component.addPermission = this.addPermission;
        component.editPermission = this.editPermission;
        component.viewPermission = this.viewPermission;
    }
}
