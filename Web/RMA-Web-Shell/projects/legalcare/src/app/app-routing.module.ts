
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';

// DO NOT REMOVE these "Unused references" Angular Compiler for some reason needs them to find the modules
import { LegalHomeComponent } from 'projects/legalcare/src/app/legal-manager/views/legal-home/legal-home.component';
import { WorkOverviewComponent } from 'projects/legalcare/src/app/work-manager/views/work-overview/work-overview.component';
const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['LegalCare view'] },
    children: [
      { path: '', component: LegalHomeComponent },
      { path: 'legal-manager', loadChildren: () => import('projects/legalcare/src/app/legal-manager/legal-manager.module').then(m => m.LegalManagerModule) },
      {path: 'work-manager', component: WorkOverviewComponent }

    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LegalCareMainRoutingModule { }



