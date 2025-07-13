import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FrameworkModule } from 'src/app/framework.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/lib/shared-services-lib.module';

import { SharedPenscareModule } from '../shared-penscare/shared-penscare.module';
import { PensionReportsManagerRoutingModule } from './pension-reports-manager-routing.module';
import { PensionReportsComponent } from './views/pension-reports/pension-reports.component';
import { ReportsLayoutComponent } from './views/reports-layout/reports-layout.component';

@NgModule({
  declarations: [
    PensionReportsComponent,
    ReportsLayoutComponent
  ],
  imports: [
    CommonModule,
    PensionReportsManagerRoutingModule,
    FrameworkModule,
    SharedModule,
    SharedPenscareModule
  ],
  providers: [
    SharedServicesLibModule,
    DatePipe
  ]
})
export class PensionReportsManagerModule {
  constructor() {}
}
