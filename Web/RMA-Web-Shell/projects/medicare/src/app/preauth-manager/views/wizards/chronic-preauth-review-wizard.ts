import { ComponentFactoryResolver, inject } from '@angular/core';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ChronicPreAuthReviewerComponent } from 'projects/medicare/src/app/preauth-manager/views/chronic-preauth-review/chronic-preauth-reviewer.component';
import { PreAuthorisation } from '../../models/preauthorisation';
import { WizardMediHolisticViewComponent } from '../../../shared/components/wizard-medi-holistic-view/wizard-medi-holistic-view.component';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
export class ChronicPreAuthReviewWizardContext extends WizardContext {
  backLink = 'medicare/work-manager';
  currentUser: User;
  authService: AuthService = inject(AuthService);
  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.currentUser = this.authService.getCurrentUser();
      if(this.currentUser?.isInternalUser){    
        this.wizardComponents.push(new WizardComponentStep(0, 'Review Chronic Auth', ChronicPreAuthReviewerComponent));
       }
      else{
       this.wizardComponents.push(new WizardComponentStep(0, 'Holistic View', WizardMediHolisticViewComponent));
       this.wizardComponents.push(new WizardComponentStep(1, 'Review Chronic Auth', ChronicPreAuthReviewerComponent));
      }
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0] as PreAuthorisation;  

    if (this.data[0]?.personEventId > 0 && this.data[0]?.claimId > 0)
      this.backLink = `/medicare/view-search-results/${this.data[0].personEventId}/holisticview/${this.data[0].claimId}`;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {

  }
}