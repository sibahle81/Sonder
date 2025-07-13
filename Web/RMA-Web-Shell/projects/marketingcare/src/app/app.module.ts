import { NgModule } from "@angular/core";
import { FrameworkModule } from "src/app/framework.module";

import { WorkManagerRoutingModule } from "projects/marketingcare/src/app/work-manager/work-manager-routing.module";
import { WorkManagerModule } from "projects/marketingcare/src/app/work-manager/work-manager.module";
import { MarketingManagerModule } from "./marketing-manager/marketing-manager.module";
import { MarketingCareMainRoutingModule } from "./app-routing.module";


//components

@NgModule({
  declarations: [], //for components
  imports: [
    FrameworkModule,
    MarketingManagerModule,
    MarketingCareMainRoutingModule,
    WorkManagerModule,
    WorkManagerRoutingModule,
  ], //for modules
  exports: [],
  providers: [
    // MarketingCareService
  ],
  bootstrap: [],
})
export class MarketingCareMainAppModule {}
