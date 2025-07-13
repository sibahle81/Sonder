import { ComponentFactoryResolver, Injectable } from "@angular/core";
import { WizardComponentStep } from "projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step";
import { WizardContext } from "projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context";
import { ClaimAbove30percentpdSCA } from "./claim-above30percentpd-sca-steps/claim-above30percentpd-sca/claim-above30percentpd-sca.component";

@Injectable({
    providedIn: 'root'
  })
  export class ClaimAbove30percentpdSCAWizard extends WizardContext {
    backLink = 'claimcare/';
    decline = 'claimcare/';
  
    constructor(componentFactoryResolver: ComponentFactoryResolver) {
      super(componentFactoryResolver);
      this.wizardComponents.push(new WizardComponentStep(0, 'Claim Above30percentpd', ClaimAbove30percentpdSCA));
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
  