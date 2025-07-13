import { ComponentFactoryResolver, inject } from '@angular/core';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { PreAuthReviewerComponent } from 'projects/medicare/src/app/preauth-manager/views/preauth-reviewer/preauth-reviewer.component';
import { PreAuthorisation } from '../../../models/preauthorisation';
import { WizardMediHolisticViewComponent } from 'projects/medicare/src/app/shared/components/wizard-medi-holistic-view/wizard-medi-holistic-view.component';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { ChronicPreAuthReviewerComponent } from '../../chronic-preauth-review/chronic-preauth-reviewer.component';
import { ProstheticPreAuthReviewerComponent } from '../../prosthetic-preauth-review/prosthetic-preauth-reviewer.component';
import { TreatmentPreAuthReviewerComponent } from '../../treatment-preauth-review/treatment-preauth-reviewer.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { RoleEnum } from 'projects/shared-models-lib/src/lib/enums/role-enum';

export class PreAuthReviewWizardContext extends WizardContext {
  backLink = 'medicare/work-manager';
  authService: AuthService = inject(AuthService);
  wizardService: WizardService = inject(WizardService);

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0] as PreAuthorisation;

    if (this.authService.getCurrentUser().roleId == RoleEnum.MedicalAdminAssistant) {
      this.wizard.wizardStatusId = +WizardStatus.New;    
    }
    this.wizardService.updateWizards([this.wizard]).subscribe();

    const preauth = JSON.parse(this.wizard.data)[0] as PreAuthorisation;
    this.wizardComponents = [];
    let reviewStep = 1;
    if (this.data[0].isRequestFromHcp) {
      this.wizardComponents.push(new WizardComponentStep(0, 'Holistic View', WizardMediHolisticViewComponent));
    }
    else {
      reviewStep = 0;
    }

    if (userUtility.hasPermission('Submit PreAuthorisation Review')) {
      if (preauth.preAuthType == PreauthTypeEnum.Hospitalization)
        this.wizardComponents.push(new WizardComponentStep(reviewStep, 'Review Hospital Auth', PreAuthReviewerComponent));
      else if (preauth.preAuthType == PreauthTypeEnum.Treatment)
        this.wizardComponents.push(new WizardComponentStep(reviewStep, 'Review Treatment Auth', TreatmentPreAuthReviewerComponent));
      else if (preauth.preAuthType == PreauthTypeEnum.Prosthetic)
        this.wizardComponents.push(new WizardComponentStep(reviewStep, 'Review Prothetic Auth', ProstheticPreAuthReviewerComponent));
      else if (preauth.preAuthType == PreauthTypeEnum.ChronicMedication)
        this.wizardComponents.push(new WizardComponentStep(reviewStep, 'Review Chronic Auth', ChronicPreAuthReviewerComponent));
    }
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
