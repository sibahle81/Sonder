import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnclaimedBenefitManagerListComponent } 
  from './unclaimed-benefit-manager-list/unclaimed-benefit-manager-list.component';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { UnclaimedBenefitManagerDetailsComponent } 
  from './unclaimed-benefit-manager-details/unclaimed-benefit-manager-details.component';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';

const routes: Routes = [
  {
    path: '', 
      component: UnclaimedBenefitManagerListComponent,
      canActivate: [SignInGuard, PermissionGuard],
      canActivateChild: [PermissionGuard],
      data: { permissions: ['Unclaimed benefit manager view'] },
      children: [
            { path: 'unclaimed-benefit-manager', component: UnclaimedBenefitManagerListComponent,
          },
             { 
              path: 'unclaimedBenefitDetails/:id', 
               component: UnclaimedBenefitManagerDetailsComponent 
             }
          ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnclaimedBenefitManagerRouteModule { }
