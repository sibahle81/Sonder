
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { PensHomeComponent } from 'projects/penscare/src/app/pens-manager/views/pens-home/pens-home.component';
import { PaymentRecallComponent } from './views/payment-recall/payment-recall.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Penscare view'] },
    children: [
      { path: '', component: PensHomeComponent },
      { path: 'pens-manager', loadChildren: () => import('projects/penscare/src/app/pens-manager/pens-manager.module').then(m => m.PensManagerModule) },
      { path: 'tax-manager', loadChildren: () => import('projects/penscare/src/app/tax-manager/tax-manager.module').then(m => m.TaxManagerModule) },
      { path: 'child-extension-manager', loadChildren: () => import('projects/penscare/src/app/child-extension-manager/child-extension.module').then(m => m.ChildExtensionManagerModule) },
      { path: 'month-end', loadChildren: () => import('projects/penscare/src/app/month-end/month-end.module').then(m => m.MonthEndModule) },
      { path: 'certificate-of-life', loadChildren: () => import('projects/penscare/src/app/certificate-of-life/certificate-of-life.module').then(m => m.CertificateOfLifeModule) },
      { path: 'reports-manager', loadChildren: () => import('projects/penscare/src/app/pension-reports-manager/pension-reports-manager.module').then(m => m.PensionReportsManagerModule) },
      { path: 'annual-increase', loadChildren: () => import('projects/penscare/src/app/annual-increase/annual-increase.module').then(m => m.AnnualIncreaseModule) },
      { path: 'overpayments', loadChildren: () => import('projects/penscare/src/app/overpayement/overpayment.module').then(m => m.OverPaymentModule) },
      { path: 'payment-recall', component: PaymentRecallComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PensCareMainRoutingModule { }
