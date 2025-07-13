import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { ReportsManagerRoutingModule } from './reports-manager-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuneralClaimReportComponent } from './views/funeral/funeral-claim-report/funeral-claim-report.component';
import { ReportViewerModule } from 'projects/shared-components-lib/src/lib/report-viewers/reportviewer.module';

@NgModule({
  declarations: [
      FuneralClaimReportComponent
    ],
  imports: [
    CommonModule,
    ReportsManagerRoutingModule,
    MaterialsModule,
    ReportViewerModule
  ],
  exports: []
})
export class ReportsManagerModule { }
