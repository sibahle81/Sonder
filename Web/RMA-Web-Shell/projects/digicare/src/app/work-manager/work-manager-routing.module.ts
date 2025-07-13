
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';

import { ClaimSearchComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/claim-search/claim-search.component';
import { WorkItemMenuComponent } from 'projects/digicare/src/app/work-manager/views/work-item-menu/work-item-menu.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';

const routes: Routes = [
  {
    path: '', component: WorkItemMenuComponent,
    canActivate: [SignInGuard,PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Work manager view'] },
    children: [
      { path: 'work-manager', loadChildren: () => import('projects/digicare/src/app/work-manager/work-manager.module').then(m => m.WorkManagerModule) },
      { path: 'first-medical-report-form', component: ClaimSearchComponent, data: { title: 'First Medical Report for an accident' }},
      { path: 'progress-medical-report-form', component: ClaimSearchComponent, data: { title: 'Progress Medical Report for an accident' }},
      { path: 'final-medical-report-form', component: ClaimSearchComponent, data: { title: 'Final Medical Report for an accident' }},
      { path: 'first-disease-medical-report-form', component: ClaimSearchComponent, data: { title: 'First Medical Report for a disease' }},
      { path: 'progress-disease-medical-report-form', component: ClaimSearchComponent, data: { title: 'Progress Medical Report for a disease' }},
      { path: 'final-disease-medical-report-form', component: ClaimSearchComponent, data: { title: 'Final Medical Report for a disease' }},
      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
    ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkManagerRoutingModule { }

