
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { RecoveryListComponent } from './views/recovery-list/recovery-list.component';
import { RecoveryViewComponent } from './views/recovery-view/recovery-view.component';
import { RecoveryHomeComponent } from './views/recovery-home/recovery-home.component';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';

const routes: Routes = [
  {
    path: '', component: RecoveryHomeComponent, 
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Recovery manager view'] },
    children: [
      { path: 'recovery-manager', component: RecoveryHomeComponent },
      { path: 'recovery-list', component: RecoveryListComponent },
      { path: 'recovery-view/:id/:claimId', component: RecoveryViewComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class RecoveryManagerRoutingModule { }
