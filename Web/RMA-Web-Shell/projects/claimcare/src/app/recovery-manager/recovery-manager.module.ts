// Thrid party
import { DatePipe } from '@angular/common';
import { NgModule, ComponentFactoryResolver } from '@angular/core';

// Additional
import { FrameworkModule } from 'src/app/framework.module';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/public-api';
import { RecoveryManagerRoutingModule } from './recovery-manager-routing.module';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { InsuredLifeService } from 'projects/clientcare/src/app/policy-manager/shared/Services/insured-life.service';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { BankBranchService } from 'projects/clientcare/src/app/client-manager/shared/services/bank-branch.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { BrokerageService } from 'projects/clientcare/src/app/broker-manager/services/brokerage.service';
import { ChartsModule } from 'ng2-charts';
import { BreadcrumbPolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/breadcrumb-policy.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { SearchEventDataSource } from '../claim-manager/views/event-case-manager/search-event/search-event.datasource';
import { RecoveryListComponent } from './views/recovery-list/recovery-list.component';
import { RecoveryListDatasource } from './views/recovery-list/recovery-list.datasource';
import { RecoveryViewComponent } from './views/recovery-view/recovery-view.component';
import { MatTabsModule } from '@angular/material/tabs';
import { RecoveryHomeComponent } from './views/recovery-home/recovery-home.component';
import { RecoveryNotesComponent } from './views/recovery-notes/recovery-notes.component';
import { RecoveryListNotesComponent } from './views/recovery-notes/recovery-list-notescomponent';

@NgModule({
    imports: [
        FrameworkModule,
        RecoveryManagerRoutingModule,
        WizardModule,
        ChartsModule,
        SharedModule,
        MatTabsModule
    ],
    declarations: [
        RecoveryListComponent,
        RecoveryViewComponent,
        RecoveryHomeComponent,
        RecoveryNotesComponent,
        RecoveryListNotesComponent
    ],
    exports: [],
    entryComponents: [
        RecoveryListComponent,
        RecoveryViewComponent,
        RecoveryHomeComponent,
        RecoveryNotesComponent,
        RecoveryListNotesComponent
    ],
    providers: [
        RolePlayerService,
        SharedServicesLibModule,
        DatePipe,
        PolicyService,
        InsuredLifeService,
        BankBranchService,
        SearchEventDataSource,
        BrokerageService,
        BreadcrumbPolicyService,
        RecoveryListDatasource
    ],
    bootstrap: []
})
export class RecoveryManagerModule {
    constructor(componentFactoryResolver: ComponentFactoryResolver, contextFacotry: WizardContextFactory) {
        // register the context factories used in the wizard controls
        // contextFacotry.addWizardContext(new RegisterFuneralWizard(componentFactoryResolver), 'register-funeral-claim');
    }
}
