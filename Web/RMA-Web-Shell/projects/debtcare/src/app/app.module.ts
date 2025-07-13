import { NgModule } from "@angular/core";
import { FrameworkModule } from "src/app/framework.module";

import { WorkManagerRoutingModule } from "projects/debtcare/src/app/work-manager/work-manager-routing.module";
import { WorkManagerModule } from "projects/debtcare/src/app/work-manager/work-manager.module";

import { DebtCareMainRoutingModule } from "projects/debtcare/src/app/app-routing.module";
import { DebtManagerModule } from "projects/debtcare/src/app/debt-manager/debt-manager.module";
import { ChartsModule } from 'ng2-charts';

//components

@NgModule({
  declarations: [], //for components
  imports: [
    FrameworkModule,
    DebtManagerModule,
    DebtCareMainRoutingModule,
    WorkManagerModule,
    WorkManagerRoutingModule,
    ChartsModule
  ], //for modules
  exports: [],
  providers: [
    // DebtCareService
  ],
  bootstrap: [],
})
export class DebtCareMainAppModule {}
