import { ReportsManagerModule } from './reports-manager/reports-manager.module';
import { NgModule } from '@angular/core';
import { ClaimCareAppRoutingModule } from './app-routing.module';
import { FrameworkModule } from 'src/app/framework.module';
import { ClaimManagerModule } from './claim-manager/claim-manager.module';
import { RecoveryManagerModule } from './recovery-manager/recovery-manager.module';
import { UnclaimedBenefitManagerModule } from './unclaimed-benefit-manager/unclaimed-benefit-manager.module';

@NgModule({
  declarations: [
  ],
  imports: [
    FrameworkModule,
    ClaimCareAppRoutingModule,
    ReportsManagerModule,
    ClaimManagerModule,
    RecoveryManagerModule,
    UnclaimedBenefitManagerModule,
  ],
  exports: [
  ],
  providers: [
  ],
  bootstrap: []
})
export class ClaimCareAppModule { }
