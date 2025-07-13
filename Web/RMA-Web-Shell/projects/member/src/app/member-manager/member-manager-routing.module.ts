import { MemberHomeComponent } from './views/member-home/member-home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { MemberLayoutComponent } from './views/member-layout/member-layout.component';
import { MemberUserAdministrationComponent } from './views/member-user-administration/member-user-administration.component';
import { MemberTermArrangementApplication } from './views/member-term-arrangement-application/member-term-arrangement-application.component';
import { MemberRefundApplicationComponent } from './views/member-refund-application/member-refund-application.component';
import { TermSchedulesViewComponent } from './views/term-schedules-view/term-schedules-view.component';
import { MemberTermArrangementDebtorDetailsComponent } from './views/member-term-arrangement-debtor-details/member-term-arrangement-debtor-details.component';
import { CaptureClaimComponent } from './views/capture-claim/capture-claim.component';

const routes: Routes = [
  {
    path: '', component: MemberLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],    
    canActivateChild: [PermissionGuard],
    data: { title: 'Member Manager', permissions: ['Member View', 'Member manager view']},
    children: [
      { path: '', component: MemberHomeComponent, data: { title: 'Home' } },
      { path: 'home', component: MemberHomeComponent, data: { title: 'Home' } },
      { path: 'home/:selectedTabIndex', component: MemberHomeComponent, data: { title: 'Home' } },
      { path: 'manage-users', component: MemberUserAdministrationComponent, data: { title: 'Manage Users' } },
      { path: 'terms-arrangement', component: MemberTermArrangementApplication, data: { title: 'Terms Arrangement' } },
      { path: 'term-arrangements', component: MemberTermArrangementDebtorDetailsComponent, data: { title: 'Term Arrangements' } },
      { path: 'view-term-schedules', component: TermSchedulesViewComponent, data: { title: 'Terms Schedules' } },
      { path: 'refunds', component: MemberRefundApplicationComponent, data: { title: 'Refunds' } },    
      { path: 'capture-claim', component: CaptureClaimComponent, data: { title: 'Capture Claim' } },   
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class MemberManagerRoutingModule { }
