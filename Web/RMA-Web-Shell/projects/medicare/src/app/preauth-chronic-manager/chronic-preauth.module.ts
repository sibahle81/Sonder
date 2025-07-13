import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChronicPreauthCaptureWizardContext } from './wizards/chronic-preauth-capture-wizard';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ChronicPreauthModule {

  constructor(componentFactoryResolver: ComponentFactoryResolver, contextFactory: WizardContextFactory) {
    contextFactory.addWizardContext(new ChronicPreauthCaptureWizardContext(componentFactoryResolver), 'capture-preauth-chronic');
      }
}
