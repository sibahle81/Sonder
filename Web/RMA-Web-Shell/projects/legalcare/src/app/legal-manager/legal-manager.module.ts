import { DatePipe } from "@angular/common";
import { NgModule, ComponentFactoryResolver } from "@angular/core";
import { FrameworkModule } from "src/app/framework.module";
import { SharedServicesLibModule } from "projects/shared-services-lib/src/public-api";
import { SharedModule } from "src/app/shared/shared.module";

import { LegalCareService } from "./services/legalcare.service";

import { LegalHomeComponent } from "./views/legal-home/legal-home.component";
import { LegalCareLayoutComponent } from "./views/legalcare-layout/legalcare-layout.component";
import { LegalManagerRoutingModule } from "./legal-manager-routing.module";
import { MatTooltipModule } from "@angular/material/tooltip";
import { LegalDetailsComponent } from './views/legal-details/legal-details.component';
import { RecoveryLegalHeadComponent } from './views/recovery-legal-head/recovery-legal-head.component';
import { TribunalLegalAdvisorComponent } from './views/tribunal-legal-advisor/tribunal-legal-advisor.component';
import { TribunalLegalSecretaryComponent } from './views/tribunal-legal-secretary/tribunal-legal-secretary.component';
import { CommonDailogComponent } from './views/common-dailog/common-dailog.component';
import { UploadDocumentDialogComponent } from './views/upload-docs-dailog/upload-docs-dailog.component';
import { LegalCollectionsAdminComponent } from './views/legal-collections-admin/legal-collections-admin.component';
import { LegalCollectionsDetailsComponent } from './views/legal-collections-details/legal-collections-details.component';
import { LegalAdminComponent } from './views/legal-admin/legal-admin.component';
import { TribunalDetailsComponent } from './views/tribunal-details/tribunal-details.component';
import { RecoveryConsultantComponent } from './views/recovery-consultant/recovery-consultant.component';
import { CurrencyCommaPipe } from './views/currency-comma.pipe';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { ActionDialogComponent } from './views/action-dialog/action-dialog.component';
import { DecimalMask } from "./views/currency.directive";
import { SharedComponentsLibModule } from "projects/shared-components-lib/src/lib/shared-components-lib.module";

@NgModule({
  imports: [
    FrameworkModule,
    LegalManagerRoutingModule,
    SharedModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    SharedComponentsLibModule
  ],
  declarations: [
    LegalHomeComponent,
    LegalCareLayoutComponent,
    LegalDetailsComponent,
    RecoveryLegalHeadComponent,
    TribunalLegalAdvisorComponent,
    TribunalLegalSecretaryComponent,
    CommonDailogComponent,
    UploadDocumentDialogComponent,
    LegalCollectionsAdminComponent,
    LegalCollectionsDetailsComponent,
    LegalAdminComponent,
    TribunalDetailsComponent,
    RecoveryConsultantComponent,
    CurrencyCommaPipe,
    DecimalMask,
    ActionDialogComponent
  ],
  exports: [],

  providers: [
    SharedServicesLibModule,
    DatePipe,
    LegalCareService,
  ],
  bootstrap: [],
})
export class LegalManagerModule {
  constructor(componentFactoryResolver: ComponentFactoryResolver) { }
}
