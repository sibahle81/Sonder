import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardComponentStep } from 'src/app/shared/components/wizard/sdk/wizard-component-step';
import { WizardContext } from 'src/app/shared/components/wizard/shared/models/wizard-context';
import { NotificationComponent } from 'src/app/shared/components/wizard/views/notification/notification.component';


@Injectable({
  providedIn: 'root'
})
export class PremiumListingRejectionNotificationWizard extends WizardContext {
  backLink = 'broker-premium-listing';
  decline = 'broker-premium-listing';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Notification', NotificationComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}