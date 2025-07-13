import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/public-api';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { CaseManagerRoutingModule } from './case-manager-routing.module';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { CaseHomeComponent } from './views/case-home/case-home.component';
import { CaseLayoutComponent } from './views/case-layout/case-layout.component';
import { CRMCustomerViewComponent } from './views/crm-customer-view/crm-customer-view.component';
import { ClientCareSharedModule } from 'projects/clientcare/src/app/shared/clientcare.shared.module';
import { ClaimCareSharedModule } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/claim-care-shared.module';
import { BrokerageService } from 'projects/clientcare/src/app/broker-manager/services/brokerage.service';

@NgModule({
    imports: [
        FrameworkModule,
        CaseManagerRoutingModule,
        SharedModule,
        MatTooltipModule,
        SharedComponentsLibModule,
        ClientCareSharedModule,
        WizardModule,
        ClaimCareSharedModule
    ],
    declarations: [
        CaseLayoutComponent,
        CaseHomeComponent,
        CRMCustomerViewComponent
    ],
    exports: [],
    providers: [
        SharedServicesLibModule,
        BrokerageService
    ],
    bootstrap: [],
})
export class CaseManagerModule {
    constructor(componentFactoryResolver: ComponentFactoryResolver) {
    }
}

