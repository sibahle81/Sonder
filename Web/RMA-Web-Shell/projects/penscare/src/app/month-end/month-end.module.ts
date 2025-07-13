import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FrameworkModule } from 'src/app/framework.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/lib/shared-services-lib.module';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { SharedPenscareModule } from '../shared-penscare/shared-penscare.module';
import { MonthEndLayoutComponent } from './views/month-end-layout/month-end-layout.component';
import { MonthEndRoutingModule } from './month-end-routing.module';
import { StartMonthEndFormComponent } from './views/start-month-end-form/start-month-end-form.component';
import { MonthEndHistoryComponent } from './views/month-end-history/month-end-history.component';
import { MonthlyPensionLedgerListComponent } from './views/monthly-pension-ledger-list/monthly-pension-ledger-list.component';
import { MonthEndDatesComponent } from './views/month-end-dates/month-end-dates.component';
import { MonthEndIrp5Component } from './views/month-end-irp5/month-end-irp5.component';
import { MonthEndPreChecksComponent } from './views/month-end-pre-checks/month-end-pre-checks.component';
import { MultipleBankingDetailsComponent } from './views/multiple-banking-details/multiple-banking-details.component';
import { ViewMultipleBankingDetailsComponent } from './views/view-multiple-banking-details/view-multiple-banking-details.component';
import { ViewMultipleBankingDetailsTabComponent } from './views/view-multiple-banking-details-tab/view-multiple-banking-details-tab.component';
import { AddMonthEndRunDateComponent } from './views/add-month-end-run-date/add-month-end-run-date.component';
import { MonthEndDatesViewComponent } from './views/month-end-dates-view/month-end-dates-view.component';
import { MonthlyPensionLedgerV2Component } from './views/monthly-pension-ledger-v2/monthly-pension-ledger-v2.component';
import { MonthlyLedgerDetailsDialogComponent } from './views/monthly-pension-ledger-v2/monthly-ledger-details-dialog/monthly-ledger-details-dialog.component';

@NgModule({
  declarations: [
    MonthEndLayoutComponent,
    StartMonthEndFormComponent,
    MonthEndHistoryComponent,
    MonthlyPensionLedgerListComponent,
    MonthEndDatesComponent,
    MonthEndIrp5Component,
    MonthEndPreChecksComponent,
    MultipleBankingDetailsComponent,
    ViewMultipleBankingDetailsComponent,
    ViewMultipleBankingDetailsTabComponent,
    AddMonthEndRunDateComponent,
    MonthEndDatesViewComponent,
    MonthlyPensionLedgerV2Component,
    MonthlyLedgerDetailsDialogComponent
  ],
  imports: [
    CommonModule,
    MonthEndRoutingModule,
    FrameworkModule,
    SharedModule,
    WizardModule,
    SharedPenscareModule
  ],
  providers: [
    SharedServicesLibModule,
    DatePipe
  ]
})
export class MonthEndModule {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    contextFactory: WizardContextFactory) {
  }
}
