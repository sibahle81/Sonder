import { BrokerRepresentativeImportComponent } from './views/broker-representative-import/broker-representative-import.comoponent';
import { BinderPartnerRepresentativeImportComponent } from './views/binderpartner-representative-import/binderpartner-representative-import.comoponent';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrokerCommissionListComponent } from './views/broker-commission-list/broker-commission-list.comoponent';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { CommissionListComponent } from './views/commission-list/commission-list.component';
import { CommissionWithholdingBalanceComponent } from './views/commission-withholding/commission-withholding-balance.compopnent';
import { BrokerManagerLayoutComponent } from './views/broker-manager-layout/broker-manager-layout.component';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { BrokerageListComponent } from './views/brokerage-list/brokerage-list.component';
import { BrokerStatementComponent } from './views/broker-statement/broker-statement.component';
import { BrokerageDetailsComponent } from './views/brokerage-details/brokerage-details.component';
import { BrokerageConsultantComponent } from './views/brokerage-consultant/brokerage-consultant.component';
import { BrokerageProductOptionsComponent } from './views/brokerage-product-options/brokerage-product-options.component';
import { BrokerageViewComponent } from './views/brokerage-view/brokerage-view.component';
import { RepresentativeViewComponent } from './views/representative-view/representative-view.component';
import { RepresentativeListComponent } from './views/representative-list/representative-list.component';
import { BrokerManagerHomeComponent } from './views/broker-manager-home/broker-manager-home.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';
import { BinderPartnerListComponent } from './views/binderpartner-list/binderpartner-list.component';

const routes: Routes = [
  {
    path: '', component: BrokerManagerLayoutComponent, 
    canActivate: [SignInGuard, PermissionGuard], 
    canActivateChild: [PermissionGuard],
    data: { title: 'Brokerage Manager', permissions: ['Broker manager view']},
    children: [
      { path: '', component: BrokerManagerHomeComponent, data: { title: 'Brokerage Manager' } },
      // { path: 'brokerage-details', component: BrokerageDetailsComponent, data: { permissions: ['View Brokerage'] }, canActivate: [SignInGuard] },
      { path: 'broker-house-details', component: BrokerageDetailsComponent, data: { permissions: ['View Brokerage'] }, canActivate: [SignInGuard] },
      { path: 'franchise-house-details', component: BrokerageDetailsComponent, data: { permissions: ['View Brokerage'] }, canActivate: [SignInGuard] },

      { path: 'brokerage-list', component: BrokerageListComponent, data: { permissions: ['View Brokerage'] }, canActivate: [SignInGuard] },
      { path: 'binderpartner-list', component: BinderPartnerListComponent, data: { permissions: ['View Brokerage'] }, canActivate: [SignInGuard] },
   
      { path: 'brokerage-details/:id', component: BrokerageViewComponent, data: { permissions: ['View Brokerage'] }, canActivate: [SignInGuard] },
      { path: 'broker-manager/brokerage-details/:id', component: BrokerageViewComponent, data: { permissions: ['View Brokerage'] }, canActivate: [SignInGuard] },

      { path: 'broker-list', component: RepresentativeListComponent, data: { permissions: ['View Representative'] }, canActivate: [SignInGuard] },
      { path: 'broker-details/:id', component: RepresentativeViewComponent, data: { permissions: ['View Representative'] }, canActivate: [SignInGuard] },

      { path: 'create-broker/:type/:action/:linkedId', component: WizardHostComponent },
      { path: 'broker-commission-list', component: BrokerCommissionListComponent },
      { path: 'broker-statement', component: BrokerStatementComponent },
      { path: 'commission-list', component: CommissionListComponent },
      { path: 'commission-withholding-balance', component: CommissionWithholdingBalanceComponent },
      { path: 'brokerage-product-options', component: BrokerageProductOptionsComponent },
      { path: 'brokerage-consultants', component: BrokerageConsultantComponent },

      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
      { path: 'broker-representative-import', component: BrokerRepresentativeImportComponent },
      { path: 'binderpartner-representative-import', component: BinderPartnerRepresentativeImportComponent },

      { path: 'binderpartner-list', component: BrokerageListComponent, data: { permissions: ['View Brokerage'] }, canActivate: [SignInGuard] },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrokerManagerRoutingModule { }
