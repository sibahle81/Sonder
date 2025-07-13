import { ReportsManagerLayoutComponent } from './views/reports-manager-layout/reports-manager-layout.component';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductManagerReportsComponent } from './views/product-manager-reports/product-manager-reports.component';
import { PolicyManagerReportsComponent } from './views/policy-manager-reports/policy-manager-reports.component';
import { LeadManagerReportsComponent } from './views/lead-manager-reports/lead-manager-reports.component';
import { QuoteManagerReportsComponent } from './views/quote-manager-reports/quote-manager-reports.component';
import { ContactManagerReportsComponent } from './views/contact-manager-reports/contact-manager-reports.component';
import { MemberManagerReportsComponent } from './views/member-manager-reports/member-manager-reports.component';

const routes: Routes = [
    {
      path: 'clientcare/clientcare-report',
      component: ReportsManagerLayoutComponent, 
      canActivate: [SignInGuard, PermissionGuard],
      canActivateChild: [PermissionGuard],
      data: { permissions: ['Reports manager view'] },
      children: [
        { path: 'clientcare/clientcare-report', component: ReportsManagerLayoutComponent },
        { path: 'product-manager-reports', component: ProductManagerReportsComponent, data: { title: 'Product Reports' } },
        { path: 'policy-manager-reports', component: PolicyManagerReportsComponent, data: { title: 'Policy Reports' } },
        { path: 'lead-manager-reports', component: LeadManagerReportsComponent, data: { title: 'Lead Reports' } },
        { path: 'quote-manager-reports', component: QuoteManagerReportsComponent, data: { title: 'Quote Reports' } },
        { path: 'contact-manager-reports', component: ContactManagerReportsComponent, data: { title: 'Contact Reports' } },
        { path: 'member-manager-reports', component: MemberManagerReportsComponent, data: { title: 'Member Reports' } },
      ]
    }
  ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })

  export class ReportsManagerRoutingModule { }
