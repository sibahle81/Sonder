import { ComponentFactoryResolver } from '@angular/core';
import { PreauthBreakdownComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { TreatingDoctorPreauthComponent } from 'projects/medicare/src/app/medi-manager/views/shared/treating-doctor-preauth/treating-doctor-preauth.component';
import { PreauthDetailsEditComponent } from 'projects/medicare/src/app/preauth-manager/views/wizards/preauth-details-edit/preauth-details-edit.component';
import { PreAuthorisation } from '../../../models/preauthorisation';

export class PreAuthEditWizardContext extends WizardContext {
  backLink = 'medicare/work-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver){
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Edit Preauthorisation details', PreauthDetailsEditComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Edit Preauthorisation breakdown', PreauthBreakdownComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Edit Treating doctor authorisation', TreatingDoctorPreauthComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0] as PreAuthorisation;
    if (this.data[0]?.personEventId > 0 && this.data[0]?.claimId > 0)
      this.backLink = `/medicare/view-search-results/${this.data[0].personEventId}/holisticview/${this.data[0].claimId}`;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}