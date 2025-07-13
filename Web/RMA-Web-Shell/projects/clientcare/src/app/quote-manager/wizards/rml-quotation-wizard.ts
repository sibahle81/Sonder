import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { QuoteV2 } from '../models/quoteV2';
import { RmaRmlQuoteDetailsComponent } from './views/rma-rml-quote-details/rma-rml-quote-details.component';
import { RmlQuotePreviewComponent } from './views/rml-quote-preview/rml-quote-preview.component';

@Injectable({
  providedIn: 'root'
})
export class RMLQuotationWizard extends WizardContext {
  backLink = '/clientcare/quote-manager/quote-search';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Quote Details', RmaRmlQuoteDetailsComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Quote Preview', RmlQuotePreviewComponent));
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0];
    const result = this.data[0] as QuoteV2;
  }

  onApprovalRequested(): void { }

  setComponentPermissions(component: any) {
    component.addPermission = this.addPermission;
    component.editPermission = this.editPermission;
    component.viewPermission = this.viewPermission;
  }
}
