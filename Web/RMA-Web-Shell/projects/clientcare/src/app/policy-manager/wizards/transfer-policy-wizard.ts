import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { TransferPolicyClientWizardComponent } from '../views/policy-wizard/transfer-policy-client/transfer-policy-client.component';
import { TransferPolicyNotesComponent } from '../views/policy-wizard/transfer-policy-notes/transfer-policy-notes.component';
import { UploadWizardComponent } from 'projects/shared-components-lib/src/lib/wizard/views/upload-wizard/upload-wizard.component';

@Injectable()
export class TransferPolicyWizard extends WizardContext {
    backLink = 'clientcare/policy-manager/policy-list/transfer-policy';

    constructor(componentFactoryResolver: ComponentFactoryResolver) {
        super(componentFactoryResolver);

        this.wizardComponents.push(new WizardComponentStep(0, 'Client Selection', TransferPolicyClientWizardComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Supporting Documents', UploadWizardComponent));
        this.wizardComponents.push(new WizardComponentStep(3, 'Transfer Notes', TransferPolicyNotesComponent));
    }

    formatData(): void {
        const arrayData: any[] = JSON.parse(this.wizard.data);
        this.data[0] = arrayData[0];
        this.data[1] = arrayData[1];
        this.data[2] = arrayData[2];
        this.data[3] = arrayData[3];
    }

    onApprovalRequested(): void { }
}
