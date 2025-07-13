import { ComponentFactoryResolver } from '@angular/core';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { InvoiceClaimSearchComponent } from '../../../medi-manager/Views/shared/invoice-claim-search/invoice-claim-search.component';
import { HealthCareProviderSearchComponent } from '../../../medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component';
import { ProsthetistQuoteCaptureComponent } from './prosthetist-quote-capture/prosthetist-quote-capture.component';
import { ProsthetistQuote } from '../../models/prosthetistquote';
import { PreAuthClaimSearchComponent } from '../../../medi-manager/views/shared/preauth-claim-search/preauth-claim-search.component';
import { PreAuthorisation } from '../../models/preauthorisation';

export class ProsthetistQuoteCaptureWizardContext extends WizardContext {
  backLink = 'medicare/work-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.captureProsthetistQuoteWizard();
  }

  formatData(): void {
    const arrayData: any[] = JSON.parse(this.wizard.data);
    this.data[0] = arrayData[0] as PreAuthorisation;
    this.wizard.currentStepIndex = 1;
    this.wizard.currentStep = "Step 1";
    if (this.data[0]?.personEventId > 0 && this.data[0]?.claimId > 0)
      this.backLink = `/medicare/view-search-results/${this.data[0].personEventId}/holisticview/${this.data[0].claimId}`;
  }

  onApprovalRequested(): void { }

  captureProsthetistQuoteWizard() {
    this.wizardComponents.push(new WizardComponentStep(0, 'Capture & confirm claimant details', PreAuthClaimSearchComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Search healthcare provider', HealthCareProviderSearchComponent));
    this.wizardComponents.push(new WizardComponentStep(2, 'Capture Prosthetist Quotation Details', ProsthetistQuoteCaptureComponent));
  }

}
