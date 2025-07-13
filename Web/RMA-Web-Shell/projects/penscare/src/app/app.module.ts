import { NgModule } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';
import { PensionCaseManagerRoutingModule } from 'projects/penscare/src/app/pensioncase-manager/pensioncase-manager-routing.module';
import { PensionCaseManagerModule } from 'projects/penscare/src/app/pensioncase-manager/pensioncase-manager.module';
import { PensCareMainRoutingModule } from 'projects/penscare/src/app/app-routing.module';
import { PensManagerModule } from 'projects/penscare/src/app/pens-manager/pens-manager.module';
import { ValidatorService } from './services/validator.service';
import { PaymentRecallComponent } from './views/payment-recall/payment-recall.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MonthEndRoutingModule } from './month-end/month-end-routing.module'; 

@NgModule({
  declarations: [
    PaymentRecallComponent
  ],
  imports: [
    FrameworkModule,
    SharedModule,
    MonthEndRoutingModule,
    PensManagerModule,
    PensCareMainRoutingModule,
    PensionCaseManagerModule,
    PensionCaseManagerRoutingModule,
    
  ],
  providers: [
    ValidatorService
  ],
  bootstrap: []
})
export class PensCareMainAppModule { }

