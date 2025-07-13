import { NgModule } from "@angular/core";
import { FrameworkModule } from "src/app/framework.module";

import { WorkManagerRoutingModule } from "projects/legalcare/src/app/work-manager/work-manager-routing.module";
import { WorkManagerModule } from "projects/legalcare/src/app/work-manager/work-manager.module";

import { LegalCareMainRoutingModule } from "projects/legalcare/src/app/app-routing.module";
import { LegalManagerModule } from "projects/legalcare/src/app/legal-manager/legal-manager.module";

//components

@NgModule({
  declarations: [], //for components
  imports: [
    FrameworkModule,
    LegalManagerModule,
    LegalCareMainRoutingModule,
    WorkManagerModule,
    WorkManagerRoutingModule,
  ], //for modules
  exports: [],
  providers: [
    // LegalCareService
  ],
  bootstrap: [],
})
export class LegalCareMainAppModule {}
