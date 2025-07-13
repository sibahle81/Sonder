
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { ChildExtensionListComponent } from './views/child-extension-list/child-extension-list.component';
import { ChildExtensionManagerLayoutComponent } from './views/child-extension-manager-layout/child-extension-manager-layout.component';
import { ChildExtensionManagerOverviewComponent } from './views/child-extension-manager-overview/child-extension-manager-overview.component';
import { ChildExtensionViewComponent } from './views/child-extension-view/child-extension-view.component';
import { ChildToAdultListComponent } from './views/child-to-adult-list/child-to-adult-list.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';

const routes: Routes = [
  {
    path: '', component: ChildExtensionManagerLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Child extension manager view'] },
    children: [
      { path: 'manage-child-extension', component: ChildExtensionManagerOverviewComponent },
      { path: 'child-to-adult', component: ChildToAdultListComponent},
      { path: 'child-extensions', component: ChildExtensionListComponent},
      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
      { path: 'view-child-extension/:beneficiaryRolePlayerId/:recipientRolePlayerId/:ledgerId', component: ChildExtensionViewComponent},
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ChildExtensionManagerRoutingModule { }
