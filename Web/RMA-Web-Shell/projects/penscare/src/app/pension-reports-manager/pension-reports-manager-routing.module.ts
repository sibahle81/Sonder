
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { PensionReportsComponent } from './views/pension-reports/pension-reports.component';
import { ReportsLayoutComponent } from './views/reports-layout/reports-layout.component';

const routes: Routes = [
  {
    path: '', component: ReportsLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],  
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Pension reports view'] },
    children: [
      { path: 'monthend-reports', component: PensionReportsComponent},
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class PensionReportsManagerRoutingModule { }
