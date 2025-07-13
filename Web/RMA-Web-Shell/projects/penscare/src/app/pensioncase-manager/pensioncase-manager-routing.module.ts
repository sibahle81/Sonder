
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { PensionCaseMenuComponent } from 'projects/penscare/src/app/pensioncase-manager/views/pensioncase-menu/pensioncase-menu.component';
import { PenscareTableLedgerComponent } from './views/penscare-table-ledger/penscare-table-ledger.component';
import { PensionCaseViewComponent } from './views/pension-case-view/pension-case-view.component';
import { CorrectiveEntryListComponent } from './views/corrective-entry-list/corrective-entry-list.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';
import { CommutationEntryListComponent } from './views/commutation-entry-list/commutation-entry-list.component';

const routes: Routes = [
  {
    path: '', component: PensionCaseMenuComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Pension case manager view'] },
    children: [
      { path: 'pensioncase-manager', loadChildren: () => import('projects/penscare/src/app/pensioncase-manager/pensioncase-manager.module').then(m => m.PensionCaseManagerModule) },
      { path: 'view-pensioncase/:pensionCaseId', component: PensionCaseViewComponent},
      { path: 'commutation-entry-list/:pensionLedgerId', component: CommutationEntryListComponent},
      { path: 'ledger-corrective-entries/:pensionLedgerId', component: CorrectiveEntryListComponent},
      { path: 'pension-cases', component: PenscareTableLedgerComponent},
      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PensionCaseManagerRoutingModule { }
