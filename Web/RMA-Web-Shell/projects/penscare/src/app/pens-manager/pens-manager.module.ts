import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/public-api';
import { SharedModule } from 'src/app/shared/shared.module';
import { PensHomeComponent } from './views/pens-home/pens-home.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PensManagerRoutingModule } from './pens-manager-routing.module';
import { PensCareLayoutComponent } from './views/penscare-layout/penscare-layout.component';
import { PensCareService } from '../pensioncase-manager/services/penscare.service';
import { PensionLedgerService } from '../pensioncase-manager/services/pension-ledger.service';
import {ProofOfLifeService} from '../pensioncase-manager/services/proof-of-life.service';

@NgModule({
    imports: [
        FrameworkModule,
        PensManagerRoutingModule,
        SharedModule,
        MatTooltipModule
    ],
    declarations: [
        PensHomeComponent,
        PensCareLayoutComponent
    ],
    exports: [
    ],
    providers: [
        SharedServicesLibModule,
        DatePipe,
        PensCareService,
        PensionLedgerService,
        ProofOfLifeService
    ],
    bootstrap: [],
})
export class PensManagerModule {
    constructor() {
    }
}
