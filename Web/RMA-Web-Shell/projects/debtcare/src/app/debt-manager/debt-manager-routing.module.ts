import { DebtHomeComponent } from './views/debt-home/debt-home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { DebtCareLayoutComponent } from './views/debt-layout/debtcare-layout.component';
import { DebtorCollectionsComponent } from './views/debtor-collections/debtor-collections.component';
import { DebtorCollectionsDetailsComponent } from './views/debtor-collections-details/debtor-collections-details.component';
import { DebtorCommonDialogComponent } from './views/debtor-common-dialog/debtor-common-dialog.component';
import { TeamLeaderDetailsComponent } from './views/team-leader-details/team-leader-details.component';
import { CollectionsTeamLeaderComponent } from './views/collections-team-leader/collections-team-leader.component';
import { DasboardChartsComponent } from './views/dasboard-charts/dasboard-charts.component';
import { DebtcareReportsComponent } from './views/debtcare-reports/debtcare-reports.component';

const routes: Routes = [
  {
    path: 'debtor-collections', component: DebtorCollectionsComponent
  },
  {
    path: 'debtor-collections-details', component: DebtorCollectionsDetailsComponent
  },
  {
    path: 'debtor-common-dialog', component: DebtorCommonDialogComponent
  },
  {
    path: 'debtor-team-leader', component: CollectionsTeamLeaderComponent
  },
  {
    path: 'team-leader-details', component: TeamLeaderDetailsComponent
  },
  {
    path: 'dashboard-chart', component: DasboardChartsComponent 
  },
  {
    path: 'debtcare-reports', component: DebtcareReportsComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class DebtManagerRoutingModule { }
