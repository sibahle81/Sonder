import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';

// DO NOT REMOVE these "Unused references" Angular Compiler for some reason needs them to find the modules
import { MemberHomeComponent } from 'projects/member/src/app/member-manager/views/member-home/member-home.component';
import { OnboardingHomeComponent } from 'projects/member/src/app/onboarding-manager/views/onboarding-home/onboarding-home.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard],
    children: [
      { path: 'member-manager', loadChildren:     () => import('projects/member/src/app/member-manager/member-manager.module').then(m => m.MemberManagerModule) },
      { path: 'onboarding-manager', loadChildren: () => import('projects/member/src/app/onboarding-manager/onboarding-manager.module').then(m => m.OnboardingManagerModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class MemberMainRoutingModule { }



