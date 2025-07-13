
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';

// DO NOT REMOVE these "Unused references" Angular Compiler for some reason needs them to find the modules
import { DebtHomeComponent } from 'projects/debtcare/src/app/debt-manager/views/debt-home/debt-home.component';
import { WorkOverviewComponent } from 'projects/debtcare/src/app/work-manager/views/work-overview/work-overview.component';
const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['DebtCare view'] },
    children: [
      { path: '', component: DebtHomeComponent },
      { path: 'debt-manager', loadChildren: () => import('projects/debtcare/src/app/debt-manager/debt-manager.module').then(m => m.DebtManagerModule) },
      {path: 'work-manager', component: WorkOverviewComponent },
      { path: 'dashboard-charts', loadChildren: () => import('projects/debtcare/src/app/debt-manager/debt-manager.module').then(m => m.DebtManagerModule) },


    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class DebtCareMainRoutingModule { }



