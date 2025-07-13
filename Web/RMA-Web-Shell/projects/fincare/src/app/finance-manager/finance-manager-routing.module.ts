import { AbilityPostingAuditComponent } from './views/ability-posting-audit/ability-posting-audit.component';
import { AbilityPostingListComponent } from './views/ability-posting-list/ability-posting-list.component';
import { ManageChartsComponent } from './views/manage-charts/manage-charts.component';
import { UnclaimedBenefitComponent} from './views/unclaimed-benefit/unclaimed-benefit.component';
import { HomeComponent } from './views/home/home.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { RecoveryAbilityPostingComponent } from './views/recovery-ability-posting/recovery-ability-posting.component';
import { RecoveryAbilityPostingAuditComponent } from './views/recovery-ability-posting-audit/recovery-ability-posting-audit.component';

const routes: Routes = [
    {
        path: '', component: HomeComponent, 
        canActivate: [SignInGuard, PermissionGuard], 
        canActivateChild: [PermissionGuard],
        data: { title: 'Finance Manager', permissions: ['Finance manager view'] },
        children: [
            { path: 'finance-manager', component: HomeComponent },
            { path: 'manage-charts', component: ManageChartsComponent },
            { path: 'ability-posting-list', component: AbilityPostingListComponent },
            { path: 'recovery-posting-list', component: RecoveryAbilityPostingComponent },
            { path: 'posted-payment-list', component: AbilityPostingAuditComponent },
            { path: 'posted-payment-list/:reference', component: AbilityPostingAuditComponent },
            { path: 'posted-recoveries-list/:id', component: RecoveryAbilityPostingAuditComponent },
            { path: 'unclaimed-benefit', component: UnclaimedBenefitComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FinanceManagerRoutingModule { }
