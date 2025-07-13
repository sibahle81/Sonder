
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';

// DO NOT REMOVE these "Unused references" Angular Compiler for some reason needs them to find the modules
import { MarketingHomeComponent } from 'projects/marketingcare/src/app/marketing-manager/views/marketing-home/marketing-home.component';
import { WorkOverviewComponent } from 'projects/marketingcare/src/app/work-manager/views/work-overview/work-overview.component';
const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['MarketingCare view'] },
    children: [
      { path: '', component: MarketingHomeComponent },
      { path: 'marketing-manager', loadChildren: () => import('projects/marketingcare/src/app/marketing-manager/marketing-manager.module').then(m => m.MarketingManagerModule) },
      {path: 'work-manager', component: WorkOverviewComponent }

    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class MarketingCareMainRoutingModule { }



