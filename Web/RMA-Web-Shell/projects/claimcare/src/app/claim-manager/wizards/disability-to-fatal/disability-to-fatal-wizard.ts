import { ComponentFactoryResolver, Injectable } from "@angular/core";
import { WizardComponentStep } from "projects/shared-components-lib/src/lib/wizard/sdk/wizard-component-step";
import { WizardContext } from "projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context";
import { DisabilityToFatalAssessComponent } from "./disability-to-fatal-assess/disability-to-fatal-assess.component";

@Injectable({
    providedIn: 'root'
  })
  export class DisabilityToFatalWizard extends WizardContext {
    backLink = 'claimcare/';
    decline = 'claimcare/';
  
    constructor(componentFactoryResolver: ComponentFactoryResolver) {
      super(componentFactoryResolver);
      this.wizardComponents.push(new WizardComponentStep(0, 'Assessement', DisabilityToFatalAssessComponent));
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
  