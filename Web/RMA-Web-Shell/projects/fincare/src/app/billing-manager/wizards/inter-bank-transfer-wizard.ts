import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { InterBankTransfersApprovalComponent } from '../views/inter-bank-transfers/inter-bank-transfers-approval/inter-bank-transfers-approval.component';
import { InterBankTransferNotesComponent } from '../views/interbanktransfer-notes/interbanktransfer-notes.component';
import { InterBankTransfer } from '../models/interBankTransfer';

@Injectable({
    providedIn: 'root'
})
export class InterBankTransferWizard extends WizardContext {
    backLink = 'fincare/billing-manager';
    decline = 'fincare/billing-manager';

    constructor(componentFactoryResolver: ComponentFactoryResolver) {
        super(componentFactoryResolver);
        this.wizardComponents.push(new WizardComponentStep(0, 'Verify Transfer Details', InterBankTransfersApprovalComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Notes', InterBankTransferNotesComponent, false, false, false));
    }

    formatData(): void {
        const arrayData: any[] = JSON.parse(this.wizard.data);
        this.data[0] = arrayData[0];
        const interbankTransfer = this.data[0] as InterBankTransfer;
        if (interbankTransfer && interbankTransfer.interDebtorTransfer) {
            this.wizard.wizardConfiguration.displayName = 'Inter Debtor Transfer';
            this.wizard.wizardConfiguration.description = 'Inter Debtor Transfer';
        }
    }

    onApprovalRequested(): void { }

    setComponentPermissions(component: any) {
        component.addPermission = this.addPermission;
        component.editPermission = this.editPermission;
        component.viewPermission = this.viewPermission;
    }
}
