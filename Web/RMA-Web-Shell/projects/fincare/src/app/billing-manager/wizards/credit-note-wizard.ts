import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { CreditNoteComponent } from '../views/credit-note/credit-note/credit-note.component';

@Injectable({
    providedIn: 'root'
})
export class CreditNoteWizard extends WizardContext {
    backLink = 'fincare/billing-manager';
    decline = 'fincare/billing-manager';

    constructor(componentFactoryResolver: ComponentFactoryResolver) {
        super(componentFactoryResolver);
        this.wizardComponents.push(new WizardComponentStep(0, 'Credit Note', CreditNoteComponent));
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
