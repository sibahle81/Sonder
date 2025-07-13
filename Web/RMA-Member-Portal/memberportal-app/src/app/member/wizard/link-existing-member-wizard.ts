import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardComponentStep } from 'src/app/shared/components/wizard/sdk/wizard-component-step';
import { WizardContext } from 'src/app/shared/components/wizard/shared/models/wizard-context';
import { UserRegistrationDetails } from 'src/app/shared/models/user-registration-details';
import { LinkMemberWizardComponent } from '../link-member-wizard/link-member-wizard.component';

@Injectable({
  providedIn: 'root'
})

export class LinkExistingMemberWizard extends WizardContext {
  backLink: string;

  breadcrumbModule = 'link-member';
  breadcrumbTitle = 'link-member';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'link-member', LinkMemberWizardComponent));
  }

  onApprovalRequested(): void { }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const userRegistrationDetails = this.data[0] as UserRegistrationDetails;
    this.backLink = ``;
  }
}
