import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { PensCareLayoutComponent } from './views/penscare-layout/penscare-layout.component';
import { PensionCaseOverviewComponent } from '../pensioncase-manager/views/pensioncase-overview/pensioncase-overview.component';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { PenscareTableLedgerComponent } from '../pensioncase-manager/views/penscare-table-ledger/penscare-table-ledger.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';

const routes: Routes = [
  {
    path: '', component: PensCareLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],    
    data: { title: 'PensCare Manager', permissions: ['Pens manager view'] },
    children: [
      { path: 'pensioncase-manager', component: PensionCaseOverviewComponent },
      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
      { path: 'pension-cases', component: PenscareTableLedgerComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class PensManagerRoutingModule { }
