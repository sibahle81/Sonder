import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { HcpManagerRoutingModule } from 'projects/hcp/src/app/hcp-manager/hcp-manager-routing.module';
import { MedicareSharedModule } from 'projects/medicare/src/app/shared/medicare.shared.module'

import { HcpLayoutComponent } from './views/hcp-layout/hcp-layout.component';
import { HcpHomeComponent } from './views/hcp-home/hcp-home.component';
import { HcpQueryInvoiceComponent } from './views/hcp-query-invoice/hcp-query-invoice.component';
import { HcpLogQueryComponent } from './views/hcp-log-query/hcp-log-query.component';
import { HcpInvoiceQueriesComponent } from './views/hcp-invoice-queries/hcp-invoice-queries.component';
import { HcpInvoiceQueryResponseComponent } from './views/hcp-invoice-query-response/hcp-invoice-query-response.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SharedComponentsLibModule,
    HcpManagerRoutingModule,
    MedicareSharedModule
  ],
  declarations: [
    HcpLayoutComponent,
    HcpHomeComponent,
    HcpQueryInvoiceComponent,
    HcpLogQueryComponent,
    HcpInvoiceQueriesComponent,
    HcpInvoiceQueryResponseComponent
  ],
  exports: [
    HcpQueryInvoiceComponent,
    HcpLogQueryComponent     
  ]
})
export class HcpManagerModule { }
