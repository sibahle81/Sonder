import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { InterDebtorTransfersApprovalComponent } from '../views/inter-debtor-transfers/inter-debtor-transfers-approval/inter-debtor-transfers-approval.component';
import { InterDebtorTransferNotesComponent } from '../views/interdebtortransfer-notes/interdebtortransfer-notes.component';

@Injectable({
    providedIn: 'root'
})
export class InterDebtorTransferWizard extends WizardContext {
    backLink = 'fincare/billing-manager';
    decline = 'fincare/billing-manager';

    constructor(componentFactoryResolver: ComponentFactoryResolver) {
        super(componentFactoryResolver);
        this.wizardComponents.push(new WizardComponentStep(0, 'Verify Transfer Details', InterDebtorTransfersApprovalComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Notes', InterDebtorTransferNotesComponent, false, false, false));
    }

    formatData(): void {
        const arrayData: any[] = JSON.parse(this.wizard.data);
        this.data[0] = arrayData[0];
    }

    onApprovalRequested(): void { }

    setComponentPermissions(component: any) {
        component.addPermission = this.addPermission;
        component.editPermission = this.editPermission;
        component.viewPermission = this.viewPermission;
    }
}
