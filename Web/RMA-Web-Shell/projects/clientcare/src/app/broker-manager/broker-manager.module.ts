import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';

import { BrokerManagerRoutingModule } from './broker-manager-routing.module';
import { AgentWizard } from './wizards/agent-wizard';
import { BrokerageWizard } from './wizards/brokerage-wizard';
import { BinderPartnerWizard } from './wizards/binderpartner-wizard';
import { LinkAgentWizard } from './wizards/link-agent-wizard';
// Services
import { BrokerageService } from './services/brokerage.service';
import { BreadcrumbBrokerService } from './services/breadcrumb-broker.service';
import { BankAccountService } from './services/bank-account.service';
import { RepresentativeService } from './services/representative.service';
import { BrokerPolicyService } from './services/broker-policy.service';
// DataSources
import { BrokerageContactDataSource } from './datasources/brokerage-contact.datasource';
import { BrokerageBankAccountDataSource } from './datasources/brokerage-bank-account.datasource';
import { BrokerCommissionListDataSource } from './datasources/broker-commission-list.datasource';
import { BrokerStatementDataSource } from './datasources/broker-statement.datasource';
import { BrokerageLastViewedListDataSource } from './datasources/brokerage-last-viewed-list.datasource';
import { CommissionWithholdingBalanceDatasource } from './datasources/commission-withholding-balance.datasource';
import { CommissionListDataSource } from './datasources/commission-list.datasource';
import { RepresentativeDataSource } from './datasources/representative.datasource';
import { BinderPartnerLastViewedListDataSource } from './datasources/binderpartner-last-viewed-list.datasource';
// Views
import { CommissionWithholdingBalanceComponent } from './views/commission-withholding/commission-withholding-balance.compopnent';
import { CommissionListComponent } from './views/commission-list/commission-list.component';
import { BrokerManagerLayoutComponent } from './views/broker-manager-layout/broker-manager-layout.component';
import { BrokerManagerHomeComponent } from './views/broker-manager-home/broker-manager-home.component';
import { BrokerageNotesComponent } from './views/brokerage-notes/brokerage-notes.component';
import { BrokerageSearchComponent } from './views/brokerage-search/brokerage-search.component';
import { BrokerageLastViewedComponent } from './views/brokerage-last-viewed/brokerage-last-viewed.component';
import { BinderPartnerLastViewedComponent } from './views/binderpartner-last-viewed/binderpartner-last-viewed.component';
import { BrokerageListComponent } from './views/brokerage-list/brokerage-list.component';
import { BinderPartnerListComponent } from './views/binderpartner-list/binderpartner-list.component';
import { BrokerStatementComponent } from './views/broker-statement/broker-statement.component';
import { BrokerCommissionListComponent } from './views/broker-commission-list/broker-commission-list.comoponent';
import { BrokerageProductOptionsComponent } from './views/brokerage-product-options/brokerage-product-options.component';
import { BrokerageDetailsComponent } from './views/brokerage-details/brokerage-details.component';
import { BrokerageContactDetailsComponent } from './views/brokerage-contact-details/brokerage-contact-details.component';
import { BrokerageBankingDetailsComponent } from './views/brokerage-banking-details/brokerage-banking-details.component';
import { BrokerageConsultantComponent } from './views/brokerage-consultant/brokerage-consultant.component';
import { BrokerageAddressListComponent } from './views/brokerage-address-list/brokerage-address-list.component';
import { BrokerageCategoriesListComponent } from './views/brokerage-categories-list/brokerage-categories-list.component';
import { BrokerageViewComponent } from './views/brokerage-view/brokerage-view.component';
import { RepresentativeNotesComponent } from './views/representative-notes/representative-notes.component';
import { RepresentativeDetailsComponent } from './views/representative-details/representative-details.component';
import { RepresentativeViewComponent } from './views/representative-view/representative-view.component';
import { RepresentativeAddressComponent } from './views/representative-address/representative-address.component';
import { RepresentativeListComponent } from './views/representative-list/representative-list.component';
import { RepresentativeLastViewedListDataSource } from './datasources/representative-last-viewed-list.datasource';
import { RepresentativeLastViewedComponent } from './views/representative-last-viewed/representative-last-viewed.component';
import { RepresentativeBrokerageLinkComponent } from './views/representative-brokerage-link/representative-brokerage-link.component';
import { RepresentativeLookupComponent } from './views/representative-lookup/representative-lookup.component';
import { RepresentativeDocumentsComponent } from './views/representative-documents/representative-documents.component';
import { BrokerageDocumentsComponent } from './views/brokerage-documents/brokerage-documents.component';
import { BrokerageAuthorizedRepresentativeComponent } from './views/brokerage-authorized-representative/brokerage-authorized-representative.component';
import { BrokerageChecksComponent } from './views/brokerage-checks/brokerage-checks.component';
import { RepresentativeChecksComponent } from './views/representative-checks/representative-checks.component';
import { RepresentativeAuthorisedRepresentativeComponent } from './views/representative-authorised-representative/representative-authorised-representative.component';
import { IntegrationService } from 'projects/shared-services-lib/src/lib/services/integrations.service';
import { CommissionPaymentRejectedNotificationWizard } from './wizards/commission-payment-rejected-notification-wizard';
import { RepresentativeWizard } from './wizards/representative-wizard';
import { RepresentativeBankingDetailsComponent } from './views/representative-banking-details/representative-banking-details.component';
import { BrokerageDialogComponent } from './views/brokerage-dialog/brokerage-dialog.component';
import { FSPEImportNotificationWizard } from './wizards/fspe-import-notification-wizard';
import { FspeNotificationComponent } from './views/fspe-import-notification/fspe-import-notification.component';
import { BrokerRepresentativeImportComponent } from './views/broker-representative-import/broker-representative-import.comoponent';
import { BinderPartnerRepresentativeImportComponent } from './views/binderpartner-representative-import/binderpartner-representative-import.comoponent';
import { ProductOptionConfigurationComponent } from './views/product-option-configuration/product-option-configuration.component';

@NgModule({
    imports: [
        FrameworkModule,
        BrokerManagerRoutingModule,
        WizardModule
    ],
    declarations: [
        BrokerManagerHomeComponent,
        BrokerManagerLayoutComponent,
        BrokerageDetailsComponent,
        BrokerageViewComponent,
        BrokerageLastViewedComponent,
        BrokerageListComponent,
        BinderPartnerListComponent,
        BinderPartnerLastViewedComponent,
        BrokerageSearchComponent,
        BrokerageNotesComponent,
        BrokerageProductOptionsComponent,
        BrokerageContactDetailsComponent,
        BrokerageBankingDetailsComponent,
        BrokerageConsultantComponent,
        BrokerageAddressListComponent,
        BrokerageCategoriesListComponent,
        BrokerageDocumentsComponent,
        BrokerageAuthorizedRepresentativeComponent,
        CommissionListComponent,
        CommissionWithholdingBalanceComponent,
        BrokerCommissionListComponent,
        BrokerStatementComponent,
        RepresentativeNotesComponent,
        RepresentativeLastViewedComponent,
        RepresentativeListComponent,
        RepresentativeDetailsComponent,
        RepresentativeViewComponent,
        RepresentativeAddressComponent,
        RepresentativeBrokerageLinkComponent,
        RepresentativeLookupComponent,
        RepresentativeDocumentsComponent,
        BrokerageChecksComponent,
        RepresentativeChecksComponent,
        RepresentativeBankingDetailsComponent,
        RepresentativeAuthorisedRepresentativeComponent,
        BrokerageDialogComponent,
        FspeNotificationComponent,
        BrokerRepresentativeImportComponent,
        BinderPartnerRepresentativeImportComponent,
        ProductOptionConfigurationComponent
    ],
    exports: [],
    providers: [
        BankAccountService,
        BreadcrumbBrokerService,
        BrokerageLastViewedListDataSource,
        BinderPartnerLastViewedListDataSource,
        BrokerageService,
        IntegrationService,
        BrokerCommissionListDataSource,
        BrokerPolicyService,
        RepresentativeLastViewedListDataSource,
        RepresentativeService,
        BrokerStatementDataSource,
        CommissionListDataSource,
        CommissionWithholdingBalanceDatasource,
        BrokerageContactDataSource,
        BrokerageBankAccountDataSource,
        RepresentativeDataSource,
        FspeNotificationComponent
    ],
    bootstrap: []
})
export class BrokerManagerModule {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    wizardContextFactory: WizardContextFactory
  ) {
    wizardContextFactory.addWizardContext(new LinkAgentWizard(componentFactoryResolver), 'link-agent');
    wizardContextFactory.addWizardContext(new AgentWizard(componentFactoryResolver), 'agent-wizard');
    wizardContextFactory.addWizardContext(new BrokerageWizard(componentFactoryResolver), 'brokerage-manager');
    wizardContextFactory.addWizardContext(new BinderPartnerWizard(componentFactoryResolver), 'binderpartner-manager');
    wizardContextFactory.addWizardContext(new CommissionPaymentRejectedNotificationWizard(componentFactoryResolver), 'commission-payment-rejected-notification');
    wizardContextFactory.addWizardContext(new RepresentativeWizard(componentFactoryResolver), 'broker-manager');
    wizardContextFactory.addWizardContext(new FSPEImportNotificationWizard(componentFactoryResolver), 'fspe-import-notification');
  }
}
