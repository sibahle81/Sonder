import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { QuoteSearchComponent } from './views/quote-search/quote-search.component';
import { QuoteHomeComponent } from './views/quote-home/quote-home.component';
import { QuoteLayoutComponent } from './views/quote-layout/quote-layout.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';
import { QuoteReportsComponent } from './views/quote-reports/quote-reports.component';
import { QuoteViewComponent } from './views/quote-view/quote-view.component';
import { ReferralReportsComponent } from 'projects/shared-components-lib/src/lib/referrals/referral-reports/referral-reports.component';

const routes: Routes = [
  {
    path: '', component: QuoteLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { title: 'Quote Manager', permissions: ['Quote manager view'] },
    children: [
      { path: '', component: QuoteHomeComponent, data: { title: 'Quote Manager' } },
      { path: 'quote', component: QuoteHomeComponent, data: { title: 'Quote Manager' } },
      { path: 'quote-search', component: QuoteSearchComponent, data: { title: 'Search Quote' } },
      { path: 'quote-view/:quoteId', component: QuoteViewComponent, data: { title: 'Quote View' } },
      
      { path: 'quote-reports', component: QuoteReportsComponent, data: { title: 'Quote Reports' } },
      { path: 'referral-reports', component: ReferralReportsComponent, data: { title: 'Referral Reports' } },

      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
    ]
  }];

@NgModule({
  imports: [
    RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class QuoteManagerRoutingModule { }
