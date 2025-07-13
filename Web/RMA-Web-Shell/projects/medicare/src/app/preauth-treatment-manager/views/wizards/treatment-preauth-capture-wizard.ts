import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { InvoiceClaimSearchComponent } from 'projects/medicare/src/app/medi-manager/Views/shared/invoice-claim-search/invoice-claim-search.component';
import { MedicalInvoiceDetailsComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/wizards/medical-invoice/medical-invoice-details/medical-invoice-details.component';
import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component'
import { PreAuthClaimSearchComponent } from '../../../medi-manager/views/shared/preauth-claim-search/preauth-claim-search.component';
import { PreAuthCaptureComponent } from '../../../preauth-manager/views/wizards/preauth-capture/preauth-capture.component';
import { PreAuthDiagnosisComponent } from '../../../medi-manager/views/shared/preauth-diagnosis/preauth-diagnosis.component';
import { PreauthBreakdownComponent } from '../../../medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';
import { TreatingDoctorPreauthComponent } from '../../../medi-manager/views/shared/treating-doctor-preauth/treating-doctor-preauth.component';

@Injectable({
    providedIn: 'root'
  })
  
export class TreatmentPreauthCaptureWizardContext extends WizardContext  {
  backLink = 'medicare/work-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver){
    super(componentFactoryResolver);
    this.captureTreatmentPreauthWizard();
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }

  onApprovalRequested(): void { }

  captureTreatmentPreauthWizard() {
    this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', PreAuthClaimSearchComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Health care provider', HealthCareProviderSearchComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Capture authorisation details', PreAuthCaptureComponent));
    this.wizardComponents.push(new WizardComponentStep(3, 'Capture ICD10 codes', PreAuthDiagnosisComponent));
    this.wizardComponents.push(new WizardComponentStep(4, 'Preauthorisation breakdown', PreauthBreakdownComponent));
  }

}
