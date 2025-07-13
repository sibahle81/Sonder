import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
// DO NOT REMOVE these "Unused references" Angular Compiler for some reason needs them to find the modules
import { ClientManagerModule } from 'projects/clientcare/src/app/client-manager/client-manager.module';
import { BrokerManagerModule } from 'projects/clientcare/src/app/broker-manager/broker-manager.module';
import { LeadManagerModule } from 'projects/clientcare/src/app/lead-manager/lead-manager.module';
import { PolicyManagerModule } from 'projects/clientcare/src/app/policy-manager/policy-manager.module';
import { ProductManagerModule } from 'projects/clientcare/src/app/product-manager/product-manager.module';
import { QuoteManagerModule } from 'projects/clientcare/src/app/quote-manager/quote-manager.module';
import { MemberManagerModule } from 'projects/clientcare/src/app/member-manager/member-manager.module';

const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Clientcare view'] },
    children: [
      { path: 'client-manager', loadChildren: () => import('projects/clientcare/src/app/client-manager/client-manager.module').then(m => m.ClientManagerModule) },
      { path: 'broker-manager', loadChildren: () => import('projects/clientcare/src/app/broker-manager/broker-manager.module').then(m => m.BrokerManagerModule) },
      { path: 'lead-manager', loadChildren: () => import('projects/clientcare/src/app/lead-manager/lead-manager.module').then(m => m.LeadManagerModule) },
      { path: 'policy-manager', loadChildren: () => import('projects/clientcare/src/app/policy-manager/policy-manager.module').then(m => m.PolicyManagerModule) },
      { path: 'product-manager', loadChildren: () => import('projects/clientcare/src/app/product-manager/product-manager.module').then(m => m.ProductManagerModule) },
      { path: 'reports-manager', loadChildren: () => import('projects/clientcare/src/app/reports-manager/reports-manager.module').then(m => m.ReportsManagerModule) },
      { path: 'quote-manager', loadChildren: () => import('projects/clientcare/src/app/quote-manager/quote-manager.module').then(m => m.QuoteManagerModule) },
      { path: 'member-manager', loadChildren: () => import('projects/clientcare/src/app/member-manager/member-manager.module').then(m => m.MemberManagerModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientCareAppRoutingModule { }
