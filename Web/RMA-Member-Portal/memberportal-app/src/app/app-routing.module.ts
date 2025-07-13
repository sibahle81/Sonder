import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SigninRedirectCallbackComponent } from './home/signin-redirect-callback/signin-redirect-callback.component';
import { SignoutRedirectCallbackComponent } from './home/signout-redirect-callback/signout-redirect-callback.component';
import { UserRegistrationComponent } from './member/user-registration/user-registration.component';
import { MemberActivationComponent } from './member/member-activation/member-activation.component';
import { UserRegistrationVopdFailedComponent } from './member/user-registration-vopd-failed/user-registration-vopd-failed.component';
import { WizardHostComponent } from './shared/components/wizard/views/wizard-host/wizard-host.component';
import { ForgotPasswordComponent } from './member/forgot-password/forgot-password.component';
import { PasswordResetComponent } from './member/password-reset/password-reset.component';
import { BrokerPolicyListComponent } from './broker/broker-policy-list/broker-policy-list.component';
import { BrokerPolicyDetailsComponent } from './broker/broker-policy-details/broker-policy-details.component';
import { BrokerDisclaimerComponent } from './broker/broker-disclaimer/broker-disclaimer.component';
import { BrokerPremiumListingComponent } from './broker/broker-premium-listing/broker-premium-listing.component';
import { CaseListComponent } from './case/case-list/case-list.component';
import { CreateCaseComponent } from './case/create-case/create-case.component';
import { QuoteViewComponent } from './quote-view/quote-view.component';
import { MobileViewQuoteComponent } from './mobile-view-quote/mobile-view-quote.component';
import { ValidateLetterOfGoodStandingComponent } from './member/validate-letter-of-good-standing/validate-letter-of-good-standing.component';
import { ExternalUserRegistrationComponent } from './external-user-registration/external-user-registration.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent, 
  },
  { path: 'signin-callback', component: SigninRedirectCallbackComponent },
  { path: 'signout-callback', component: SignoutRedirectCallbackComponent },
  { path: 'user-registration', component: UserRegistrationComponent },
  { path: 'external-user-registration', component: ExternalUserRegistrationComponent },
  { path: 'member-activation/:id', component: MemberActivationComponent },
  { path: 'validate-logs', component: ValidateLetterOfGoodStandingComponent },
  { path: 'broker-policy-list', component: BrokerPolicyListComponent },
  { path: 'user-vopd-failed/:id', component: UserRegistrationVopdFailedComponent },
  { path: ':type/:action/:linkedId', component: WizardHostComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'password-reset/:id', component: PasswordResetComponent },
  { path: 'policy-details/:id', component: BrokerPolicyDetailsComponent },
  { path: 'broker-disclaimer', component: BrokerDisclaimerComponent },
  { path: 'broker-premium-listing', component: BrokerPremiumListingComponent },
  { path: 'case-list', component: CaseListComponent },
  { path: 'create-case', component: CreateCaseComponent },
  { path: 'view-quote/:id', component: QuoteViewComponent },
  { path: 'view-quote', component: MobileViewQuoteComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
