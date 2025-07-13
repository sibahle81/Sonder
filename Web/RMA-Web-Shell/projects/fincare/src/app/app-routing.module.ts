
// import { BillingManagerModule } from 'projects/fincare/src/app/billing-manager/billing-manager.module';
// import { HomeComponent } from './billing-manager/views/home/home.component';

// const routes: Routes = [
//   {
//     path: '',
//     canActivate: [SignInGuard],
//     children: [
//       { path: '', component: HomeComponent },
//       { path: 'billing-manager', loadChildren: 'projects/fincare/src/app/billing-manager/billing-manager.module#BillingManagerModule' }
//     ]
//   }
// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule]
// })
// export class FincareAppRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
// DO NOT REMOVE these "Unused references" Angular Compiler for some reason needs them to find the modules
// import { ClientManagerModule } from 'projects/clientcare/src/app/client-manager/client-manager.module';
// import { BrokerManagerModule } from 'projects/clientcare/src/app/broker-manager/broker-manager.module';
// import { LeadManagerModule } from 'projects/clientcare/src/app/lead-manager/lead-manager.module';
// import { PolicyManagerModule } from 'projects/clientcare/src/app/policy-manager/policy-manager.module';
// import { ProductManagerModule } from 'projects/clientcare/src/app/product-manager/product-manager.module';
// import { QuoteManagerModule } from 'projects/clientcare/src/app/quote-manager/quote-manager.module';
// import { MemberManagerModule } from 'projects/clientcare/src/app/member-manager/member-manager.module';
import { BillingManagerModule } from 'projects/fincare/src/app/billing-manager/billing-manager.module';
import { FinanceManagerModule } from 'projects/fincare/src/app/finance-manager/finance-manager.module';
import { PaymentManagerModule } from 'projects/fincare/src/app/payment-manager/payment-manager.module';
import { HomeComponent } from './billing-manager/views/home/home.component';
import { FincareDashboardComponent } from './dashboard/fincare-dashboard/fincare-dashboard.component';
import { CollectionsDashboardComponent } from './dashboard/collection-dashboard/collections-dashboard.component';
import { EstimationDashboardComponent } from './dashboard/estimation-dashboard/estimation-dashboard.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['FinCare view'] },
    children: [
      { path: '', component: HomeComponent },
      { path: 'billing-manager', loadChildren: () => import('projects/fincare/src/app/billing-manager/billing-manager.module').then(m => m.BillingManagerModule) },
      { path: 'finance-manager', loadChildren: () => import('projects/fincare/src/app/finance-manager/finance-manager.module').then(m => m.FinanceManagerModule) },
      { path: 'payment-manager', loadChildren: () => import('projects/fincare/src/app/payment-manager/payment-manager.module').then(m => m.PaymentManagerModule) },
      { path: 'reports-manager', loadChildren: () => import('projects/fincare/src/app/reports-manager/reports-manager.module').then(m => m.ReportsManagerModule) },
      { path: 'fincare-dashboard', component: FincareDashboardComponent },
      { path: 'collections-dashboard', component: CollectionsDashboardComponent },
      { path: 'estimation-dashboard', component: EstimationDashboardComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FincareAppRoutingModule { }
