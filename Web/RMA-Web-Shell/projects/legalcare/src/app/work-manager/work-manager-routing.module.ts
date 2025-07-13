
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';

import { CaseSearchComponent } from 'projects/legalcare/src/app/legal-manager/views/shared/case-search/case-search.component';
import { WorkItemMenuComponent } from 'projects/legalcare/src/app/work-manager/views/work-item-menu/work-item-menu.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';

const routes: Routes = [
  {
    path: '', component: WorkItemMenuComponent,
    canActivate: [SignInGuard,PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Work manager view'] },
    children: [
      { path: 'work-manager', loadChildren: () => import('projects/legalcare/src/app/work-manager/work-manager.module').then(m => m.WorkManagerModule) },
      { path: 'case-search', component: CaseSearchComponent, data: { title: 'Legal Case Search' }},
      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
    ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkManagerRoutingModule { }

