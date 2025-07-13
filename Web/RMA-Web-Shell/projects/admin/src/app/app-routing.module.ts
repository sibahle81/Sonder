import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';


const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard],
    children: [
      { path: 'user-manager', loadChildren: () => import('projects/admin/src/app/user-manager/user-manager.module').then(m => m.UserManagerModule) },
      { path: 'campaign-manager', loadChildren: () => import('projects/admin/src/app/campaign-manager/campaign-manager.module').then(m => m.CampaignManagerModule) },
      { path: 'config-manager', loadChildren: () => import('projects/admin/src/app/configuration-manager/config-manager.module').then(m => m.ConfigManagerModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


