
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { TaxManagerLayoutComponent } from './views/tax-manager-layout/tax-manager-layout.component';
import { TaxRebatesComponent } from './views/tax-rebates/tax-rebates.component';
import { TaxRatesComponent } from './views/tax-rates/tax-rates.component';
import { TaxManagerOverviewComponent } from './views/tax-manager-overview/tax-manager-overview.component';
import { TaxRatesViewComponent } from './views/tax-rates/tax-rates-view/tax-rates-view.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';

const routes: Routes = [
  {
    path: '', component: TaxManagerLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],    
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Tax manager view'] },
    children: [
      { path: 'manage-tax', component: TaxManagerOverviewComponent },
      { path: 'tax-rebates', component: TaxRebatesComponent},
      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
      { path: 'tax-rates', component: TaxRatesComponent},
      { path: 'view-tax-rates', component: TaxRatesViewComponent}
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class TaxManagerRoutingModule { }
