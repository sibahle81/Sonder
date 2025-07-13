import { ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { MedicalInvoiceQueryResponseComponent } from './medical-invoice/medical-invoice-query-response/medical-invoice-query-response.component';
import { InvoiceQueryDetails } from '../../models/invoice-query-details';

export class MedicalInvoiceQueryResponseWizardContext extends WizardContext  {
  backLink =  'medicare/medical-invoice-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver){
    super(componentFactoryResolver);
    this.captureMedicalInvoiceQueryResponseWizard();
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0] as InvoiceQueryDetails;
  }

  onApprovalRequested(): void { }

  captureMedicalInvoiceQueryResponseWizard() {
    this.wizardComponents.push(new WizardComponentStep(0, 'Query Response', MedicalInvoiceQueryResponseComponent));
  }

}
