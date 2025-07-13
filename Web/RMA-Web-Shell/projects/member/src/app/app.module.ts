import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

import { FrameworkModule } from 'src/app/framework.module';
import { MemberMainRoutingModule } from 'projects/member/src/app/app-routing.module';
import { MemberManagerModule } from 'projects/member/src/app/member-manager/member-manager.module';
import { OnboardingManagerModule } from 'projects/member/src/app/onboarding-manager/onboarding-manager.module';
import { OnboardingManagerRoutingModule } from './onboarding-manager/onboarding-manager-routing.module';

@NgModule({
  declarations: [],
  imports: [
    FrameworkModule,
    MemberManagerModule,
    MemberMainRoutingModule,
    OnboardingManagerModule,
    OnboardingManagerRoutingModule
  ],
  exports: [],
  providers: [
    DatePipe
  ],
  bootstrap: []
})
export class MemberMainAppModule { }

