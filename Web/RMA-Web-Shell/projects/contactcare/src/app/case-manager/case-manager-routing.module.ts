import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { CaseLayoutComponent } from './views/case-layout/case-layout.component';
import { CaseHomeComponent } from './views/case-home/case-home.component';
import { ReferralReportsComponent } from 'projects/shared-components-lib/src/lib/referrals/referral-reports/referral-reports.component';
import { CRMCustomerViewComponent } from './views/crm-customer-view/crm-customer-view.component';

const routes: Routes = [
  {
    path: '', component: CaseLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],    
    canActivateChild: [PermissionGuard],
    // data: { title: 'Member Manager', permissions: ['Member view', 'Member manager view']},
    children: [
      { path: '', component: CaseHomeComponent, data: { title: 'Home' } },
      { path: 'home', component: CaseHomeComponent, data: { title: 'Home' } },
      { path: 'referral-reports', component: ReferralReportsComponent, data: { title: 'Referral Reports' } }, 
      { path: 'crm-customer-view', component: CRMCustomerViewComponent, data: { title: '360 Customer View' } },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CaseManagerRoutingModule { }
