import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { LeadsHomeComponent } from './views/leads-home/leads-home.component';
import { LeadsLayoutComponent } from './views/leads-layout/leads-layout.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';
import { LeadViewComponent } from './views/leads-holistic/lead-view.component';
import { LeadReportsComponent } from './views/lead-reports/lead-reports.component';
import { BulkLeadUploadComponent } from './views/bulk-lead-upload/bulk-lead-upload.component';
import { ReferralReportsComponent } from 'projects/shared-components-lib/src/lib/referrals/referral-reports/referral-reports.component';

const routes: Routes = [
  {
    path: '', component: LeadsLayoutComponent, 
    canActivate: [SignInGuard, PermissionGuard], 
    canActivateChild: [PermissionGuard],
    data: { title: 'Leads Manager', permissions: ['Member manager view'] },
    children: [
      { path: '', component: LeadsHomeComponent, data: { title: 'Leads Manager' } },
      { path: 'leads', component: LeadsHomeComponent, data: { title: 'Leads' } },

      { path: 'lead-view', component: LeadViewComponent, data: { title: 'Create Lead' } },
      { path: 'lead-view/:leadId', component: LeadViewComponent, data: { title: 'Manage Lead' } },

      { path: 'bulk-lead-upload', component: BulkLeadUploadComponent, data: { title: 'Upload' } },
      
      { path: 'lead-reports', component: LeadReportsComponent, data: { title: 'Lead Reports' } },
      { path: 'referral-reports', component: ReferralReportsComponent, data: { title: 'Referral Reports' } },

      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
    ]
  }];

@NgModule({
  imports: [
    RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LeadManagerRoutingModule { }
