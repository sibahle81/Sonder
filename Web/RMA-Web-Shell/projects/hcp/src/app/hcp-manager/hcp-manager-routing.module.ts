import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';

import { HcpLayoutComponent } from 'projects/hcp/src/app/hcp-manager/views/hcp-layout/hcp-layout.component';
import { HcpHomeComponent } from 'projects/hcp/src/app/hcp-manager/views/hcp-home/hcp-home.component';

const routes: Routes = [
  {
    path: '', component: HcpLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],    
    canActivateChild: [PermissionGuard],
    data: { title: 'HCP Manager', permissions: ['Hcp manager view']},
    children: [
        { path: '', component: HcpHomeComponent, data: { title: 'Home' } },
        { path: 'home', component: HcpHomeComponent, data: { title: 'Home' } },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class HcpManagerRoutingModule { }