import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

import { FrameworkModule } from 'src/app/framework.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/public-api';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { WizardModule } from "projects/shared-components-lib/src/lib/wizard/wizard.module";

import { OnboardingManagerRoutingModule } from './onboarding-manager-routing.module';
import { OnboardingHomeComponent } from './views/onboarding-home/onboarding-home.component';
import { OnboardingLayoutComponent } from './views/onboarding-layout/onboarding-layout.component';
import { ConsolidatedFuneralUploadWizard } from './wizards/consolidated-funeral-upload-wizard';

@NgModule({
  declarations: [
    OnboardingHomeComponent,
    OnboardingLayoutComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    FrameworkModule,
    MatTooltipModule,
    WizardModule,
    SharedComponentsLibModule,
    OnboardingManagerRoutingModule

  ],
  providers: [
    SharedServicesLibModule
  ],
  bootstrap: [],
})
export class OnboardingManagerModule {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    wizardContextFactory: WizardContextFactory
  ) { 
    wizardContextFactory.addWizardContext(new ConsolidatedFuneralUploadWizard(componentFactoryResolver), 'cfp-onboarding');
  }
}
