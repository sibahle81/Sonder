import { ClientCoverService } from './../../../../clientcare/src/app/policy-manager/shared/Services/client-cover.service';
import { BankService } from 'projects/clientcare/src/app/client-manager/shared/services/bank.service';
import { ConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.component';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/lib/shared-components-lib.module';
import { AbilityPostingAuditDatasource } from './views/ability-posting-audit/ability-posting-audit.datasource';
import { AbilityPostingDatasource } from './views/ability-posting-list/ability-posting-list.datasource';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ClientService } from 'projects/clientcare/src/app/client-manager/shared/services/client.service';
import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FrameworkModule } from 'src/app/framework.module';
import { FinanceManagerRoutingModule } from './finance-manager-routing.module';
import { ReplacePipe } from 'projects/shared-utilities-lib/src/lib/pipes/replace-pipe';
import { AbilityPostingAuditComponent } from './views/ability-posting-audit/ability-posting-audit.component';
import { AbilityPostingListComponent } from './views/ability-posting-list/ability-posting-list.component';
import { ManageChartsComponent } from './views/manage-charts/manage-charts.component';
import { HomeComponent } from './views/home/home.component';
import { MenuComponent } from './views/menu/menu.component';
import { AbilityPostingService } from './services/ability-posting.service';
import { FinanceLandingComponent } from './views/finance-landing/finance-landing.component';
import { ChartsModule } from 'ng2-charts';
import { BankAccountService } from 'projects/clientcare/src/app/client-manager/shared/services/bank-account.service';
import { ProductCrossRefTranTypeService } from './services/productCrossRefTranType.service';
import { ChartsListDatasource } from './views/charts-list/charts-list.datasource';
import { ChartsListComponent } from './views/charts-list/charts-list.component';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { UnclaimedBenefitComponent } from './views/unclaimed-benefit/unclaimed-benefit.component';
import { UnclaimBnefitsValuesService } from './views/unclaim-bnefits-values.service';
import { RecoveryAbilityPostingComponent } from './views/recovery-ability-posting/recovery-ability-posting.component';
import { RecoveryAbilityPostingAuditComponent } from './views/recovery-ability-posting-audit/recovery-ability-posting-audit.component';
import { RecoveryAbilityPostingDatasource } from './views/recovery-ability-posting/recovery-ability-posting.datasource';
import { RecoveryAbilityPostingAuditDatasource } from './views/recovery-ability-posting-audit/recovery-ability-posting-audit.datasource';
import { AbilityCollectionsService } from '../shared/services/ability-collections.service';

@NgModule({
    imports: [
        FrameworkModule,
        FinanceManagerRoutingModule,
        SharedComponentsLibModule,
        ChartsModule
    ],
    declarations: [
        HomeComponent,
        MenuComponent,
        AbilityPostingAuditComponent,
        AbilityPostingListComponent,
        ManageChartsComponent,
        FinanceLandingComponent,
        ChartsListComponent,
        UnclaimedBenefitComponent,
        RecoveryAbilityPostingComponent,
        RecoveryAbilityPostingAuditComponent
        
    ],
    exports: [],
    entryComponents: [
        HomeComponent,
        ConfirmationDialogComponent
    ],
    providers: [
        ClientService,
        ClientCoverService,
        DatePipe,
        ReplacePipe,
        BankService,
        BankAccountService,
        AbilityPostingAuditDatasource,
        AbilityPostingDatasource,
        ConfirmationDialogsService,
        AbilityPostingService,
        ProductCrossRefTranTypeService,
        ChartsListDatasource,
        PolicyService,
        UnclaimBnefitsValuesService,
        RecoveryAbilityPostingDatasource,
        RecoveryAbilityPostingAuditDatasource,
        AbilityCollectionsService
    ]
})

export class FinanceManagerModule {
    constructor(componentFactoryResolver: ComponentFactoryResolver, contextFacotry: WizardContextFactory) {
    }
}
