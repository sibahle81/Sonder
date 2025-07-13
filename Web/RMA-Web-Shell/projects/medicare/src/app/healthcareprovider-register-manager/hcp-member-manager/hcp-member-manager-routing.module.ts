
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { HCPMemberLayoutComponent } from './views/hcp-member-layout/hcp-member-layout.component';
import { HCPMemberHomeComponent } from './views/hcp-member-home/hcp-member-home.component';
import { HCPMemberUserAdministrationComponent } from './views/hcp-member-user-administration/hcp-member-user-administration.component';
import { CaptureNewHealthcareProviderComponent } from './wizards/healthcare-provider-registration/capture-new-healthcare-provider-component/capture-new-healthcare-provider-component';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';

const routes: Routes = [
  { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },//required for wizard routing
  {
    path: 'manage-hcp', component: HCPMemberLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { title: 'Member Manager', permissions: ['Member view', 'Member manager view'] },
    children: [
      { path: 'manage-hcp-profile', component: HCPMemberHomeComponent, data: { title: 'Home' } },
      { path: 'manage-hcp-users', component: HCPMemberUserAdministrationComponent, data: { title: 'Manage Users' } },
      { path: 'register-new-healthcare-provider', component: CaptureNewHealthcareProviderComponent, data: { title: 'Register New Healthcare Provider' } },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class HCPMemberManagerRoutingModule { }
