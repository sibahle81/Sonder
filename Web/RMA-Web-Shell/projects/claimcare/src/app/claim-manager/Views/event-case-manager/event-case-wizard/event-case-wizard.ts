import { EventComponent } from './../event/event.component';
import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { PersonEventComponent } from '../person-event/person-event.component';
import { EventSummaryComponent } from '../event-summary/event-summary.component';
import { EventModel } from '../../../shared/entities/personEvent/event.model';
@Injectable({
  providedIn: 'root'
})
export class EventWizard extends WizardContext {
  backLink = 'claimcare/claim-manager/event-manager/event';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Event Details', EventComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Person Details', PersonEventComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Summary', EventSummaryComponent));
  }

  onApprovalRequested(): void {}

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];

    const event = this.data[0] as EventModel;
    if (event.eventId === 0) {
        this.breadcrumbTitle = 'Add an Event';
    } else {
        this.breadcrumbTitle = 'Edit an Event';
    }
  } 
}
