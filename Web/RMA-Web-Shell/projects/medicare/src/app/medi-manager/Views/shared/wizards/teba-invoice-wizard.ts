import { ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component'
import { TebaInvoiceCaptureDetailsComponent } from './teba-invoice-capture-details/teba-invoice-capture-details.component';
import { InvoiceClaimSearchComponent } from '../invoice-claim-search/invoice-claim-search.component';
import { TebaInvoice } from 'projects/medicare/src/app/medical-invoice-manager/models/teba-invoice';

export class TebaInvoiceWizardContext extends WizardContext {
    backLink = 'medicare/work-manager/teba-invoice-list';

    constructor(componentFactoryResolver: ComponentFactoryResolver) {
        super(componentFactoryResolver);
        this.captureMedicalInvoiceWizard();
    }

    formatData(): void {
        const arrayData: any[] = JSON.parse(this.wizard.data);
        this.data[0] = arrayData[0] as TebaInvoice;
        if (this.data[0]?.personEventId > 0 && this.data[0]?.claimId > 0)
            this.backLink = `/medicare/view-search-results/${this.data[0].personEventId}/holisticview/${this.data[0].claimId}`;
    }

    onApprovalRequested(): void { }

    captureMedicalInvoiceWizard() {
        this.wizardComponents.push(new WizardComponentStep(0, 'Capture claimant details', InvoiceClaimSearchComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Search healthcare provider', HealthCareProviderSearchComponent));
        this.wizardComponents.push(new WizardComponentStep(2, 'Capture teba invoice header, line items & sub totals ', TebaInvoiceCaptureDetailsComponent));
    }

}
