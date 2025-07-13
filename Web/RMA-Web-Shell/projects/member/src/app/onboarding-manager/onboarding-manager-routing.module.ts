import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsolidatedFuneralUploadComponent } from 'projects/shared-components-lib/src/lib/consolidated-funeral-upload/consolidated-funeral-upload.component';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { OnboardingLayoutComponent } from './views/onboarding-layout/onboarding-layout.component';
import { OnboardingHomeComponent } from './views/onboarding-home/onboarding-home.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';

const routes: Routes = [
  {
    path: '', component: OnboardingLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { title: 'Onboarding Manager', permissions: ['Member View', 'Onboarding manager view'] },
    children: [
      { path: '', component: OnboardingHomeComponent, data: { title: 'Home' } },
      { path: 'home', component: OnboardingHomeComponent, data: { title: 'Home' } },
      { path: 'home/:selectedTabIndex', component: OnboardingHomeComponent, data: { title: 'Home' } },
      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
      { path: 'member-upload', component: ConsolidatedFuneralUploadComponent, data: { title: 'Member Upload' } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class OnboardingManagerRoutingModule { }
