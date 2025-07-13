import { ComponentFactoryResolver } from '@angular/core';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { PreAuthReviewerComponent } from 'projects/medicare/src/app/preauth-manager/views/preauth-reviewer/preauth-reviewer.component';
import { WizardMediHolisticViewComponent } from 'projects/medicare/src/app/shared/components/wizard-medi-holistic-view/wizard-medi-holistic-view.component';
import { PreAuthorisation } from '../../../models/preauthorisation';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { TreatmentPreAuthReviewWizardContext } from '../treatment-preauth-review-wizard';
import { TreatmentPreAuthReviewerComponent } from '../../treatment-preauth-review/treatment-preauth-reviewer.component';
import { ProstheticPreAuthReviewerComponent } from '../../prosthetic-preauth-review/prosthetic-preauth-reviewer.component';
import { ChronicPreAuthReviewerComponent } from '../../chronic-preauth-review/chronic-preauth-reviewer.component';

export class PreAuthReviewExternalSourceWizardContext extends WizardContext {
  backLink = 'medicare/work-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver){
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Holistic View', WizardMediHolisticViewComponent));    
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);

    const preauth = JSON.parse(this.wizard.data)[0] as PreAuthorisation; 
    if(preauth.preAuthType == PreauthTypeEnum.Hospitalization)
        this.wizardComponents.push(new WizardComponentStep(1, 'Review', PreAuthReviewerComponent));    
    else if(preauth.preAuthType == PreauthTypeEnum.Treatment)
      this.wizardComponents.push(new WizardComponentStep(1, 'Review', TreatmentPreAuthReviewerComponent));     
    else if(preauth.preAuthType == PreauthTypeEnum.Prosthetic)
      this.wizardComponents.push(new WizardComponentStep(1, 'Review', ProstheticPreAuthReviewerComponent)); 
    else if(preauth.preAuthType == PreauthTypeEnum.ChronicMedication)
      this.wizardComponents.push(new WizardComponentStep(1, 'Review', ChronicPreAuthReviewerComponent)); 

    this.data[0] = arrayData[0]; 
    this.backLink = `/medicare/view-search-results/${preauth.personEventId}/holisticview/${preauth.preAuthId}`;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
  
}