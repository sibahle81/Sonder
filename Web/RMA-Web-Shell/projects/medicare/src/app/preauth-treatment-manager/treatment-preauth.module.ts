import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreatmentPreauthCaptureWizardContext } from './wizards/treatment-preauth-capture-wizard';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { TreatmentPreauthEditWizardContext } from './wizards/treatment-preauth-edit-wizard';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class TreatmentPreauthModule {

  constructor(componentFactoryResolver: ComponentFactoryResolver, contextFactory: WizardContextFactory) {
    contextFactory.addWizardContext(new TreatmentPreauthCaptureWizardContext(componentFactoryResolver), 'capture-preauth-treatment');
    contextFactory.addWizardContext(new TreatmentPreauthEditWizardContext(componentFactoryResolver), 'edit-preauth-treatment');
  }
}
