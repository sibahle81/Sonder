import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component';
import { PreAuthClaimSearchComponent } from '../../../medi-manager/views/shared/preauth-claim-search/preauth-claim-search.component';
import { PreAuthCaptureComponent } from '../../../preauth-manager/views/wizards/preauth-capture/preauth-capture.component';
import { PreAuthDiagnosisComponent } from '../../../medi-manager/views/shared/preauth-diagnosis/preauth-diagnosis.component';
import { PreauthBreakdownComponent } from '../../../medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';
import { ProstheticQuotationTypeComponent } from '../../../preauth-manager/views/prosthetic-quotation-type/prosthetic-quotation-type.component';
import { PreauthDetailsEditComponent } from 'projects/medicare/src/app/preauth-manager/views/wizards/preauth-details-edit/preauth-details-edit.component';
import { PreAuthorisation } from '../../models/preauthorisation';


@Injectable({
    providedIn: 'root'
  })
  
export class ProsthetistPreauthEditWizard extends WizardContext  {
  backLink = 'medicare/work-manager';
  
  constructor(componentFactoryResolver: ComponentFactoryResolver){
    super(componentFactoryResolver);
    this.captureProsthetistPreauthWizard();
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0] as PreAuthorisation;
    if (this.data[0]?.personEventId > 0 && this.data[0]?.claimId > 0)
      this.backLink = `/medicare/view-search-results/${this.data[0].personEventId}/holisticview/${this.data[0].claimId}`;
  }

  onApprovalRequested(): void { }

  captureProsthetistPreauthWizard() {

    this.wizardComponents.push(new WizardComponentStep(0, 'Edit Preauthorisation details', PreauthDetailsEditComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Edit authorisation details', PreAuthCaptureComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Edit Preauthorisation breakdown', PreauthBreakdownComponent));
   }

}
