import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardComponentStep } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step';
import { ReAlloctionComponent } from '../views/manual-allocation/re-allocation/re-alloction/re-alloction.component';
import { CreditNoteReallocationNotesComponent } from '../views/credit-note-reallocation-notes/credit-note-reallocation-notes.component';

@Injectable({
  providedIn: 'root'
})
export class CreditNoteReallocationWizard extends WizardContext {
  backLink = 'fincare/billing-manager';
  decline = 'fincare/billing-manager';

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
    this.wizardComponents.push(new WizardComponentStep(0, 'Reallocation', ReAlloctionComponent));
    this.wizardComponents.push(new WizardComponentStep(1, 'Notes', CreditNoteReallocationNotesComponent, true, false, false));
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
