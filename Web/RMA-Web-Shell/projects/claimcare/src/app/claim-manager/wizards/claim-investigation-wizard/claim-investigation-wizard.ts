import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { ClaimInvestigationDocumentComponent } from './claim-investigation-documents/claim-investigation-document.component';
import { ClaimInvestigationNoteComponent } from './claim-investigation-note/claim-investigation-note.component';
import { ClaimInvestigationModel } from '../../shared/entities/funeral/claim-investigation-model';
import { ClaimInvestigationClaimsDocumentComponent } from './claim-investigation-claim-documents/claim-investigation-claim-documents.component';

@Injectable({
  providedIn: 'root'
})

export class ClaimInvestigationWizard extends WizardContext {
  backLink = 'claimcare/claim-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Claim Investigation Notes', ClaimInvestigationNoteComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Claim Investigation Documents', ClaimInvestigationDocumentComponent ));
    this.wizardComponents.push(new WizardComponentStep(2, 'Claims Documents', ClaimInvestigationClaimsDocumentComponent ));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const claimantRecovery = this.data[0] as ClaimInvestigationModel;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
