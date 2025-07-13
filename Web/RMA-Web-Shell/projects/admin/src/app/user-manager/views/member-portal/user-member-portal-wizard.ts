import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { UserAddressMemberPortalComponent } from './user-approval-wizard/user-address-member-portal/user-address-member-portal.component';
import { UserDetailsMemberPortalComponent } from './user-approval-wizard/user-details-member-portal/user-details-member-portal.component';
import { UserDocumentMemberPortalComponent } from './user-approval-wizard/user-document-member-portal/user-document-member-portal.component';
import { UserRegistrationDetails } from './user-registration-details.model';


@Injectable({
  providedIn: 'root'
})

export class UserMemberPortalWizard extends WizardContext {
  backLink: string;

  breadcrumbModule = 'User Approval';
  breadcrumbTitle = 'User Approval VOPD/Passport';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'User Information', UserDetailsMemberPortalComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'User Address', UserAddressMemberPortalComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'User Document', UserDocumentMemberPortalComponent));
  }

  onApprovalRequested(): void { }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const userRegistrationDetails = this.data[0] as UserRegistrationDetails;
    this.backLink = ``;
  }
}
