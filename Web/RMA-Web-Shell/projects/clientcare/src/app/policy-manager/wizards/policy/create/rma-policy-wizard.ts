import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { QuoteV2 } from '../../../../quote-manager/models/quoteV2';
import { PolicyMemberDetailsWizardComponent } from './policy-wizard-steps/policy-member-details/policy-member-details-wizard.component';
import { PolicyDetailsWizardComponent } from './policy-wizard-steps/policy-details/policy-details-wizard.component';
import { PolicySchedulePreviewWizardComponent } from './policy-wizard-steps/policy-schedule-preview/policy-schedule-preview-wizard.component';

@Injectable({
  providedIn: 'root'
})

export class RMAPolicyWizard extends WizardContext {
  backLink = '/clientcare/policy-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Member', PolicyMemberDetailsWizardComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Policy Details', PolicyDetailsWizardComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Schedule Preview', PolicySchedulePreviewWizardComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const data = this.data[0] as QuoteV2;

    this.backLink = `/clientcare/member-manager/member-wholistic-view/${this.wizard.linkedItemId}/1`;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
