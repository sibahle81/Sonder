import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { PersonEventModel } from '../../shared/entities/personEvent/personEvent.model';
import { CaptureEarningsSection51 } from './capture-earnings-wizard-steps/capture-earnings-section-51-step/capture-earnings-section-51.component';

@Injectable({
  providedIn: 'root'
})

export class CaptureEarningsSection51Wizard extends WizardContext {
  backLink = 'claimcare/claim-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Capture Earnings', CaptureEarningsSection51));
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
