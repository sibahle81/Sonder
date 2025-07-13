import { NgModule } from '@angular/core';
import { ClientCareAppRoutingModule } from './app-routing.module';
import { FrameworkModule } from 'src/app/framework.module';
import { ClientCareSharedModule } from './shared/clientcare.shared.module';
import { ReportsManagerModule } from './reports-manager/reports-manager.module';
import { QuoteManagerModule } from './quote-manager/quote-manager.module';
import { MemberManagerModule } from './member-manager/member-manager.module';

@NgModule({
  declarations: [],
  imports: [
    FrameworkModule,
    ClientCareAppRoutingModule,
    ClientCareSharedModule,
    ReportsManagerModule,
    QuoteManagerModule,
    MemberManagerModule
  ],
  exports: [],
  providers: [],
  bootstrap: []
})
export class ClientCareAppModule { }
