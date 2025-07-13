import { ReportsManagerLayoutComponent } from './views/reports-manager-layout/reports-manager-layout.component';
import { ReportsHomeComponent } from './views/reports-home/reports-home.component';
import { ReportsManagerRoutingModule } from './reports-manager-routing.module';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProductManagerReportsComponent } from './views/product-manager-reports/product-manager-reports.component';
import { PolicyManagerReportsComponent } from './views/policy-manager-reports/policy-manager-reports.component';
import { LeadManagerReportsComponent } from './views/lead-manager-reports/lead-manager-reports.component';
import { QuoteManagerReportsComponent } from './views/quote-manager-reports/quote-manager-reports.component';
import { ContactManagerReportsComponent } from './views/contact-manager-reports/contact-manager-reports.component';
import { MemberManagerReportsComponent } from './views/member-manager-reports/member-manager-reports.component';
import { BrokerageService } from '../broker-manager/services/brokerage.service';
import { ReportViewerModule } from 'projects/shared-components-lib/src/lib/report-viewers/reportviewer.module';

@NgModule({
  declarations: [
    ReportsManagerLayoutComponent,
    ReportsHomeComponent,
    ProductManagerReportsComponent,
    PolicyManagerReportsComponent,
    LeadManagerReportsComponent,
    QuoteManagerReportsComponent,
    ContactManagerReportsComponent,
    MemberManagerReportsComponent
    ],
  imports: [
    CommonModule,
    ReportsManagerRoutingModule,
    MaterialsModule,
    ReportViewerModule,
    SharedModule
  ],
  exports: [],
  providers: [
    DatePipe,
    BrokerageService
  ],
})
export class ReportsManagerModule { }
