
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';

// DO NOT REMOVE these "Unused references" Angular Compiler for some reason needs them to find the modules
import { DigiHomeComponent } from 'projects/digicare/src/app/digi-manager/Views/digi-home/digi-home.component';
import { WorkOverviewComponent } from 'projects/digicare/src/app/work-manager/views/work-overview/work-overview.component';
const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['DigiCare view'] },
    children: [
      { path: '', component: DigiHomeComponent },
      { path: 'digi-manager', loadChildren: () => import('projects/digicare/src/app/digi-manager/digi-manager.module').then(m => m.DigiManagerModule) },
      {path: 'work-manager', component: WorkOverviewComponent }

    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class DigiCareMainRoutingModule { }



