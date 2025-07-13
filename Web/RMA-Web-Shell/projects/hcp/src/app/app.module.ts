import { NgModule } from '@angular/core';

import { FrameworkModule } from 'src/app/framework.module';
import { HcpMainAppRoutingModule } from './app-routing.module';
import { HcpManagerModule } from 'projects/hcp/src/app/hcp-manager/hcp-manager.module';

@NgModule({
  declarations: [],
  imports: [
    FrameworkModule,
    HcpMainAppRoutingModule,
    HcpManagerModule
  ],
  providers: [],
  bootstrap: []
})
export class HcpMainAppModule { }
