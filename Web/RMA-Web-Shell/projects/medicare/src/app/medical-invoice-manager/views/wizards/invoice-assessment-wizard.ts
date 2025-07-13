import { ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { InvoiceClaimSearchComponent } from 'projects/medicare/src/app/medi-manager/Views/shared/invoice-claim-search/invoice-claim-search.component';
import { MedicalInvoiceDetailsComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/wizards/medical-invoice/medical-invoice-details/medical-invoice-details.component';
import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component'
import { WizardMediHolisticViewComponent } from '../../../shared/components/wizard-medi-holistic-view/wizard-medi-holistic-view.component';
import { InvoiceAssessmentDetailsComponent } from '../invoice-assessment-details/invoice-assessment-details.component';

export class MedicalInvoiceAssesmentWizardContext extends WizardContext  {
  backLink =  'medicare/medical-invoice-list';

  constructor(componentFactoryResolver: ComponentFactoryResolver){
    super(componentFactoryResolver);
    this.captureMedicalInvoiceWizard();
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
  }

  onApprovalRequested(): void { }

  captureMedicalInvoiceWizard() {
    this.wizardComponents.push(new WizardComponentStep(0, 'Assessment', InvoiceAssessmentDetailsComponent));   
  }

}
