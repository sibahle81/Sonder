import { ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { MaaRoutingWizardComponent } from './maa-routing-wizard.component';
import { MaaRoutingHolisticViewComponent } from '../maa-routing-holistic-view/maa-routing-holistic-view.component';
import { MaaRouting } from '../../../../models/maa-routing';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { ChronicPreAuthReviewerComponent } from '../../../chronic-preauth-review/chronic-preauth-reviewer.component';
import { PreAuthReviewerComponent } from '../../../preauth-reviewer/preauth-reviewer.component';
import { ProstheticPreAuthReviewerComponent } from '../../../prosthetic-preauth-review/prosthetic-preauth-reviewer.component';
import { TreatmentPreAuthReviewerComponent } from '../../../treatment-preauth-review/treatment-preauth-reviewer.component';
import { PreAuthorisation } from '../../../../models/preauthorisation';

export class MaaRoutingWizardContext extends WizardContext {
  backLink = 'medicare/preauth-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Holistic View', MaaRoutingHolisticViewComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Assign', MaaRoutingWizardComponent));
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