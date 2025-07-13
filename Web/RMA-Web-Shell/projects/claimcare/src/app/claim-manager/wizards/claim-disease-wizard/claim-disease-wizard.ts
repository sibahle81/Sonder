import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { EventModel } from '../../shared/entities/personEvent/event.model';
import { ClaimClaimantDetailsWizardComponent } from '../claim-accident-wizard/claim-claimant-details-wizard/claim-claimant-details-wizard.component';
import { ClaimDiseaseDetailsWizardComponent } from './claim-disease-details-wizard/claim-disease-details-wizard.component';
import { ClaimAccidentDocumentWizardComponent } from '../claim-accident-wizard/claim-accident-document-wizard/claim-accident-document-wizard.component';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Injectable({
  providedIn: 'root'
})

export class ClaimDiseaseWizard extends WizardContext {
  currentUser: User;
  backLink = '';

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    private readonly authService: AuthService) {
    super(componentFactoryResolver);

    this.currentUser = this.authService.getCurrentUser();
    this.backLink = this.currentUser?.isInternalUser ? 'claimcare/claim-manager' : 'member/member-manager/home/2';
    
    this.wizardComponents.push(new WizardComponentStep(0, 'Disease Details', ClaimDiseaseDetailsWizardComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Employee Details', ClaimClaimantDetailsWizardComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Employee Document', ClaimAccidentDocumentWizardComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const eventDetails = this.data[0] as EventModel;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
