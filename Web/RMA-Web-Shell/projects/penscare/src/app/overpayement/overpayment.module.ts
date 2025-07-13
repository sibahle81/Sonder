import { CommonModule, DatePipe } from "@angular/common";
import { NgModule, ComponentFactoryResolver } from "@angular/core";
import { MatTooltipModule } from "@angular/material/tooltip";
import { WizardContextFactory } from "projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory";
import { SharedServicesLibModule } from "projects/shared-services-lib/src/public-api";
import { FrameworkModule } from "src/app/framework.module";
import { SharedModule } from "src/app/shared/shared.module";
import { SharedPenscareModule } from "../shared-penscare/shared-penscare.module";
import { OverPaymentRoutingModule } from "./overpayment-routing.module";
import { OverpaymentLayoutComponent } from './views/overpayment-layout/overpayment-layout.component';
import { HomeComponent } from './views/home/home.component';
import { OverpaymentLedgerComponent } from './views/overpayment-ledger/overpayment-ledger.component';
import { OverpaymentHistoryComponent } from './views/overpayment-history/overpayment-history.component';
import { OverPaymentWizardContext } from "./views/wizards/overpayment-wizard";
import { WizardModule } from "projects/shared-components-lib/src/lib/wizard/wizard.module";
import { OverPaymentService } from "./services/overpayment.service";
import { OverPaymentDataSource } from "./views/overpayment-ledger/overpayment-ledger-datasource";
import { OverpaymentFormComponent } from './views/overpayment-form/overpayment-form.component';
import { OverpaymentWizardComponent } from './views/wizards/overpayment-wizard/overpayment-wizard.component';
import { WriteOffComponent } from './views/write-off/write-off.component';
import { ProcessWriteOffComponent } from './views/process-write-off/process-write-off.component';
import { WriteOffTableComponent } from './views/write-off-table/write-off-table.component';

@NgModule({
  imports: [
    OverPaymentRoutingModule,
    CommonModule,
    FrameworkModule,
    SharedModule,
    WizardModule,
    MatTooltipModule,
    SharedPenscareModule,
  ],
  declarations: [
    OverpaymentLayoutComponent,
    HomeComponent,
    OverpaymentLedgerComponent,
    OverpaymentHistoryComponent,
    OverpaymentFormComponent,
    OverpaymentWizardComponent,
    WriteOffComponent,
    ProcessWriteOffComponent,
    WriteOffTableComponent
  ],
  providers: [
    SharedServicesLibModule,
    DatePipe,
    OverPaymentService,
    OverPaymentDataSource
  ]

})

export class OverPaymentModule {
  constructor (componentFactoryResolver: ComponentFactoryResolver,
              contextFactory: WizardContextFactory) {
              contextFactory.addWizardContext(new OverPaymentWizardContext(componentFactoryResolver), 'overpayment-wizard');
  }
}
