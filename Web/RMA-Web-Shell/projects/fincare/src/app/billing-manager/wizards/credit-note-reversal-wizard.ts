import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { CreditNoteReversalDetailsComponent } from '../views/credit-note-reversal-details/credit-note-reversal-details.component';
import { CreditNoteReversalDocumentsComponent } from '../views/credit-note-reversal-documents/credit-note-reversal-documents.component';
import { CreditNoteReversalNotesComponent } from '../views/credit-note-reversal-notes/credit-note-reversal-notes.component';

@Injectable({
    providedIn: 'root'
})
export class CreditNoteReversalWizard extends WizardContext {
    backLink = 'fincare/billing-manager';
    decline = 'fincare/billing-manager';

    constructor(componentFactoryResolver: ComponentFactoryResolver) {
        super(componentFactoryResolver);
        this.wizardComponents.push(new WizardComponentStep(0, 'Credit Note Details', CreditNoteReversalDetailsComponent));
        this.wizardComponents.push(new WizardComponentStep(1, 'Notes', CreditNoteReversalNotesComponent));
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
