import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard],
    children: [
      { path: 'claim-manager', loadChildren: () => import('projects/claimcare/src/app/claim-manager/claim-manager.module').then(m => m.ClaimManagerModule) },
      { path: 'reports-manager', loadChildren: () => import('projects/claimcare/src/app/reports-manager/reports-manager.module').then(m => m.ReportsManagerModule) },
      { path: 'recovery-manager', loadChildren: () => import('projects/claimcare/src/app/recovery-manager/recovery-manager.module').then(m => m.RecoveryManagerModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClaimCareAppRoutingModule { }
