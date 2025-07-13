import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/public-api';
import { SharedModule } from 'src/app/shared/shared.module';
import { MemberHomeComponent } from './views/member-home/member-home.component';
import { MemberLayoutComponent } from './views/member-layout/member-layout.component';
import { MemberManagerRoutingModule } from './member-manager-routing.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MemberUserAdministrationComponent } from './views/member-user-administration/member-user-administration.component';
import { ClientCareSharedModule } from 'projects/clientcare/src/app/shared/clientcare.shared.module';
import { MemberTermArrangementApplication } from './views/member-term-arrangement-application/member-term-arrangement-application.component';
import { QuoteViewDialogComponent } from './views/member-home/quote-view-dialog/quote-view-dialog.component';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { MemberRefundApplicationComponent } from './views/member-refund-application/member-refund-application.component';
import { TermSchedulesViewComponent } from './views/term-schedules-view/term-schedules-view.component';
import { MemberTermArrangementDebtorDetailsComponent } from './views/member-term-arrangement-debtor-details/member-term-arrangement-debtor-details.component';
import { CaptureClaimComponent } from './views/capture-claim/capture-claim.component';
import { EventHolisticViewDialogComponent } from './views/member-home/event-holistic-view-dialog/event-holistic-view-dialog.component';
import { ClaimCareSharedModule } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/claim-care-shared.module';
import { BrokerageService } from 'projects/clientcare/src/app/broker-manager/services/brokerage.service';

@NgModule({
    imports: [
        FrameworkModule,
        MemberManagerRoutingModule,
        SharedModule,
        MatTooltipModule,       
        ClientCareSharedModule,
        SharedComponentsLibModule,
        ClaimCareSharedModule    
    ],
    declarations: [
        MemberHomeComponent,
        MemberLayoutComponent,
        MemberUserAdministrationComponent,
        MemberTermArrangementApplication,
        QuoteViewDialogComponent,
        EventHolisticViewDialogComponent,
        MemberRefundApplicationComponent,
        TermSchedulesViewComponent,
        MemberTermArrangementDebtorDetailsComponent,
        CaptureClaimComponent   
    ],
    exports: [

    ],
    providers: [
        SharedServicesLibModule,
        BrokerageService
    ],
    bootstrap: [],
})
export class MemberManagerModule {
    constructor(componentFactoryResolver: ComponentFactoryResolver) {
    }
}

