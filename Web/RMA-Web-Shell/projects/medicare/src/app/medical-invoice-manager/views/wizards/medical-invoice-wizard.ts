import { ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { InvoiceClaimSearchComponent } from 'projects/medicare/src/app/medi-manager/Views/shared/invoice-claim-search/invoice-claim-search.component';
import { MedicalInvoiceDetailsComponent } from 'projects/medicare/src/app/medical-invoice-manager/views/wizards/medical-invoice/medical-invoice-details/medical-invoice-details.component';
import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component'
import { InvoiceDetails } from '../../models/medical-invoice-details';

export class MedicalInvoiceWizardContext extends WizardContext  {
  backLink =  'medicare/medical-invoice-list';

  constructor(componentFactoryResolver: ComponentFactoryResolver){
    super(componentFactoryResolver);
    this.captureMedicalInvoiceWizard();
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0] as InvoiceDetails;
    if (this.data[0]?.personEventId > 0 && this.data[0]?.claimId > 0)
      this.backLink = `/medicare/view-search-results/${this.data[0].personEventId}/holisticview/${this.data[0].claimId}`;
  }

  onApprovalRequested(): void { }

  captureMedicalInvoiceWizard() {
    this.wizardComponents.push(new WizardComponentStep(0, 'Capture claimant details', InvoiceClaimSearchComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Search healthcare provider', HealthCareProviderSearchComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Capture invoice header, line items & sub totals ', MedicalInvoiceDetailsComponent));
  }

}
