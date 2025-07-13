import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { NgModule, ComponentFactoryResolver } from "@angular/core";

import { SharedServicesLibModule } from "projects/shared-services-lib/src/lib/shared-services-lib.module";
import { WizardContextFactory } from "projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory";
import { SharedModule } from "src/app/shared/shared.module";
import { WizardModule } from "projects/shared-components-lib/src/lib/wizard/wizard.module";
import { FrameworkModule } from "src/app/framework.module";

import { DebtCareService } from "projects/debtcare/src/app/debt-manager/services/debtcare.service";
import { DebtManagerModule } from "projects/debtcare/src/app/debt-manager/debt-manager.module";
import { WorkManagerRoutingModule } from "projects/debtcare/src/app/work-manager/work-manager-routing.module";
import { WorkOverviewComponent } from "projects/debtcare/src/app/work-manager/views/work-overview/work-overview.component";
import { WorkItemSelectorComponent } from "projects/debtcare/src/app/work-manager/views/work-item-selector/work-item-selector.component";
import { WorkItemsDataSource } from "projects/debtcare/src/app/work-manager/datasources/work-items.datasource";
import { WorkItemMenuComponent } from "projects/debtcare/src/app/work-manager/views/work-item-menu/work-item-menu.component";

@NgModule({
  imports: [
    FrameworkModule,
    WorkManagerRoutingModule,
    WizardModule,
    SharedModule,
    FormsModule,
    MatSelectModule,
    MatInputModule,
    DebtManagerModule,
  ],
  declarations: [
    WorkOverviewComponent,
    WorkItemSelectorComponent,
    WorkItemMenuComponent,
  ],
  exports: [],
  entryComponents: [],
  providers: [SharedServicesLibModule, DebtCareService, WorkItemsDataSource],
  bootstrap: [],
})
export class WorkManagerModule {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    contextFactory: WizardContextFactory
  ) {
    // register the context factories used in the wizard controls
  }
}
