import { ComponentFactoryResolver, Injectable } from "@angular/core";
import { WizardComponentStep } from "projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step";
import { WizardContext } from "projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context";
import { ClaimPensionPMCA } from "projects/claimcare/src/app/claim-manager/wizards/claim-pension-pmca-wizard/claim-pension-pmca-steps/claim-pension-pmca/claim-pension-pmca.component";

@Injectable({
    providedIn: 'root'
  })
  export class ClaimPensionPMCAWizard extends WizardContext {
    backLink = 'claimcare/';
    decline = 'claimcare/';
  
    constructor(componentFactoryResolver: ComponentFactoryResolver) {
      super(componentFactoryResolver);
      this.wizardComponents.push(new WizardComponentStep(0, 'Claim Pension PMCA', ClaimPensionPMCA));
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
  