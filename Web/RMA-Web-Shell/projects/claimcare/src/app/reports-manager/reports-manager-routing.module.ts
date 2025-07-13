import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { FuneralClaimReportComponent } from './views/funeral/funeral-claim-report/funeral-claim-report.component';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';

const routes: Routes = [
  {
    path: 'funeral/claim-report', component: FuneralClaimReportComponent, 
    canActivate: [SignInGuard,  PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Reports manager view'] },
    children: [
      { path: 'funeral/claim-report', component: FuneralClaimReportComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ReportsManagerRoutingModule { }
