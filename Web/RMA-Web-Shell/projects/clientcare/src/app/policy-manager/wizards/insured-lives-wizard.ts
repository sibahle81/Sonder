import { WizardStatus } from './../../../../../shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { PremiumListing } from '../shared/entities/premium-listing';
import { InsuredLivesComponent } from '../views/insured-lives/insured-lives.component';
import { InsuredLivesValidationComponent } from '../views/insured-lives-validation/insured-lives-validation.component';
import { InsuredLivesDocumentsGroupComponent } from '../views/insured-lives-documents-group/insured-lives-documents-group.component';
import { InsuredLivesDocumentsMemberComponent } from '../views/insured-lives-documents-member/insured-lives-documents-member.component';

@Injectable({
  providedIn: 'root'
})

export class InsuredLivesWizard extends WizardContext {
  backLink = 'clientcare/policy-manager';
  decline = 'clientcare/policy-manager/new-business';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Insured Lives Summary', InsuredLivesComponent));
  }

  formatData(): void {
    if (this.wizard.wizardStatusId === WizardStatus.AwaitingApproval) {
      if (this.wizardComponents.length < 3) {
        this.wizardComponents.push(new WizardComponentStep(1, 'Insured Lives Import', InsuredLivesValidationComponent));
        this.wizardComponents.push(new WizardComponentStep(2, 'Membership Certificates', InsuredLivesDocumentsMemberComponent));
      }
    } else if (this.wizardComponents.length >= 3) {
      this.wizardComponents.splice(1, 3);
    }
    this.data[0] = JSON.parse(this.wizard.data);
    const testData = this.data[0] as PremiumListing;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
