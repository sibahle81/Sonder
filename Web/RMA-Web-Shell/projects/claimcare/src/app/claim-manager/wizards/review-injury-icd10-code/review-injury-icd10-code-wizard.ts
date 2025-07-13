import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { ReviewInjuryIcd10CodeComponent } from './review-injury-icd10-code-wizard-steps/review-injury-icd10-code.component';
import { PersonEventModel } from '../../shared/entities/personEvent/personEvent.model';

@Injectable({
  providedIn: 'root'
})

export class ReviewInjuryIcd10CodeWizard extends WizardContext {
  backLink = 'claimcare/claim-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Review Injury ICD10 Code', ReviewInjuryIcd10CodeComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const data = this.data[0] as PersonEventModel;
    this.backLink = `/claimcare/claim-manager/holistic-claim-view/${data.eventId}/${data.personEventId}`;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
