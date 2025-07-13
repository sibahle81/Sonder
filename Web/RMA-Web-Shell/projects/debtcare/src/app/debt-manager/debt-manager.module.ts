import { DatePipe } from "@angular/common";
import { NgModule, ComponentFactoryResolver } from "@angular/core";
import { FrameworkModule } from "src/app/framework.module";
import { SharedServicesLibModule } from "projects/shared-services-lib/src/public-api";
import { SharedModule } from "src/app/shared/shared.module";
import { DebtCareService } from "./services/debtcare.service";
import { DebtHomeComponent } from "./views/debt-home/debt-home.component";
import { DebtManagerRoutingModule } from "./debt-manager-routing.module";
import { MatTooltipModule } from "@angular/material/tooltip";
import { DebtCareLayoutComponent } from "./views/debt-layout/debtcare-layout.component";
import { DebtorCollectionsComponent } from './views/debtor-collections/debtor-collections.component';
import { DebtorCommonDialogComponent } from './views/debtor-common-dialog/debtor-common-dialog.component';
import { DebtorCollectionsDetailsComponent } from './views/debtor-collections-details/debtor-collections-details.component';
import { CollectionsTeamLeaderComponent } from './views/collections-team-leader/collections-team-leader.component';
import { TeamLeaderDetailsComponent } from './views/team-leader-details/team-leader-details.component';
import { MatChipsModule } from '@angular/material/chips';
import { FormSubmitDirective } from './views/shared/errors-control/form-submit.directive';
import { ActionDialogComponent } from './views/action-dialog/action-dialog.component';
import { DasboardChartsComponent } from './views/dasboard-charts/dasboard-charts.component';
import { ChartsModule } from 'ng2-charts';
import { DebtcareReportsComponent } from "./views/debtcare-reports/debtcare-reports.component";
import { SharedComponentsLibModule } from "projects/shared-components-lib/src/lib/shared-components-lib.module";
import { DebtorReportsComponent } from "./views/debtor-reports/debtor-reports.component";

@NgModule({
  imports: [
    FrameworkModule,
    DebtManagerRoutingModule,
    SharedModule,
    MatTooltipModule,
    MatChipsModule,
    ChartsModule,
    SharedComponentsLibModule
  ],
  declarations: [
    DebtHomeComponent,
    DebtCareLayoutComponent,
    DebtorCollectionsComponent,
    DebtorCommonDialogComponent,
    DebtorCollectionsDetailsComponent,
    CollectionsTeamLeaderComponent,
    TeamLeaderDetailsComponent,
    FormSubmitDirective,
    ActionDialogComponent,
    DasboardChartsComponent,
    DebtcareReportsComponent,
    DebtorReportsComponent],
  exports: [],

  providers: [
    SharedServicesLibModule,
    DatePipe,
    DebtCareService,
  ],
  bootstrap: [],
})
export class DebtManagerModule {
  constructor(componentFactoryResolver: ComponentFactoryResolver) { }
}
