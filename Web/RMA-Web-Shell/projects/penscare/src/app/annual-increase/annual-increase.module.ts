import { ComponentFactoryResolver, NgModule } from "@angular/core";
import { AnnualIncreaseRoutingModule } from "./annual-increase-routing.module";
import { AnnualIncreaseComponent } from "./views/annual-increase/annual-increase.component";
import { AnnualIncreaseConfigurationComponent } from "./views/annual-increase-configuration/annual-increase-configuration.component";
import { AnnualIncreaseHistoryComponent } from "./views/annual-increase-history/annual-increase-history.component";
import { AnnualIncreaseLayoutComponent } from "./views/annual-increase-layout/annual-increase-layout.component";
import { CommonModule, DatePipe } from "@angular/common";
import { FrameworkModule } from "src/app/framework.module";
import { SharedModule } from "src/app/shared/shared.module";
import { SharedPenscareModule } from "../shared-penscare/shared-penscare.module";
import { SharedServicesLibModule } from "projects/shared-services-lib/src/lib/shared-services-lib.module";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AnnualIncreaseService } from "./services/annual-increase.service";
import { HomeComponent } from "./views/home/home.component";
import { WizardContextFactory } from "projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory";
import { AnnualIncreaseWizardContext } from "./views/wizards/annual-increase-wizard";
import { AnnualIncreaseWizardComponent } from './views/wizards/annual-increase-wizard/annual-increase-wizard.component';
import { BonusPaymentsList } from "./views/bonus-payments-list/bonus-payments-list.component";
import { BonusPaymentWizardContext } from "./views/wizards/bonus-payment-wizard/bonus-payment-wizard";
import { BonusPaymentWizardComponent } from "./views/wizards/bonus-payment-wizard/bonus-payment-wizard.component";
import { BonusPaymentDetailsComponent } from "./views/bonus-payment-details/bonus-payment-details.component";
import {InitiateGazettePensionIncreaseComponent} from './views/initiateGazettePensionIncrease/initiate-Gazette-Pension-Increase';

@NgModule({
  imports: [
    AnnualIncreaseRoutingModule,
    CommonModule,
    FrameworkModule,
    SharedModule,
    SharedPenscareModule,
    MatTooltipModule
  ],
  declarations: [
    AnnualIncreaseComponent,
    AnnualIncreaseConfigurationComponent,
    AnnualIncreaseHistoryComponent,
    AnnualIncreaseLayoutComponent,
    HomeComponent,
    AnnualIncreaseWizardComponent,
    BonusPaymentsList,
    BonusPaymentWizardComponent,
    BonusPaymentDetailsComponent,
    InitiateGazettePensionIncreaseComponent
  ],
  providers: [
    SharedServicesLibModule,
    AnnualIncreaseService,
    DatePipe,
  ]

})

export class AnnualIncreaseModule {
  constructor (annualIncreaseService: AnnualIncreaseService,
              componentFactoryResolver: ComponentFactoryResolver,
              contextFactory: WizardContextFactory) {
    annualIncreaseService.loadLookupsCache();
    contextFactory.addWizardContext(new AnnualIncreaseWizardContext(componentFactoryResolver), 'pensions-annual-increase');
    contextFactory.addWizardContext(new BonusPaymentWizardContext(componentFactoryResolver), 'pensions-bonus-payment');
  }
}
