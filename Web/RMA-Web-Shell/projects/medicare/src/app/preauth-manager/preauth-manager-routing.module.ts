
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';

import { PreAuthWorkItemMenuComponent } from './views/preauth-work-item-menu/preauth-work-item-menu.component';
import { PreAuthClaimSearchComponent } from '../medi-manager/views/shared/preauth-claim-search/preauth-claim-search.component';
import { TariffSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/tariff-search/tariff-search.component';
import { CrosswalkSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-crosswalk-search/preauth-crosswalk-search.component';
import { PreAuthHCPComponent } from '../medi-manager/views/shared/preauth-hcp/preauth-hcp.component';
import { PreAuthViewComponent } from './views/preauth-view/preauth-view.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';
import { SearchPreauthorisationComponent } from './views/search-preauthorisation/search-preauthorisation.component';
import { PreauthListComponent } from './views/preauth-list/preauth-list-component';
import { TreatmentPreAuthDetailsComponent } from '../preauth-manager/views/treatment-preauth-details/treatment-preauth-details.component';

import { ChronicPreauthDetailsComponent } from 'projects/medicare/src/app/preauth-chronic-manager/views/chronic-preauth-details/chronic-preauth-details.component';
import { ProsthetistQuoteListComponent } from './views/prosthetist-quote-list/prosthetist-quote-list.component';
import { ProsthetistQuoteViewComponent } from './views/prosthetist-quote-view/prosthetist-quote-view.component';
import { ProsthetistPreauthDetailsComponent } from './views/prosthetist-preauth-details/prosthetist-preauth-details.component';

const routes: Routes = [
  {
    path: '', component: PreAuthWorkItemMenuComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Preauth manager view'] },
    children: [
      { path: 'work-manager', loadChildren: () => import('projects/medicare/src/app/preauth-manager/preauth-manager.module').then(m => m.PreAuthManagerModule) },
      { path: 'preauth-capture-form', component: PreAuthClaimSearchComponent, data: { title: 'PreAuth capture' } },
      { path: 'preauth-view/:id', component: PreAuthViewComponent, data: { title: 'PreAuth View' } },
      { path: 'tariff', component: TariffSearchComponent, data: { title: 'Tariff Search' } },
      { path: 'RPL', component: CrosswalkSearchComponent, data: { title: 'Crosswalk Search' } },
      { path: 'preauth-hcp', component: PreAuthHCPComponent, data: { title: 'PreAuth Select' } },
      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },
      { path: 'search-preauthorisation', component: SearchPreauthorisationComponent, data: { title: 'Search PreAuthorisation' } },
      { path: 'preauth-list/:type', component: PreauthListComponent, data: { title: 'Search PreAuth List' } },
      { path: 'treatment-preauth-details/:id', component: TreatmentPreAuthDetailsComponent, data: { title: 'Treatment PreAuth Details' } },
      { path: 'chronic-preauth-details/:id', component: ChronicPreauthDetailsComponent, data: { title: 'Chronic PreAuth Details' } },
      { path: 'prosthetist-quote-list', component: ProsthetistQuoteListComponent, data: { title: 'Prosthetist Quote List' } },
      { path: 'prosthetist-quote-view/:id', component: ProsthetistQuoteViewComponent, data: { title: 'Prosthetist Quote View' } },
      { path: 'prosthetist-preauth-details/:id', component: ProsthetistPreauthDetailsComponent, data: { title: 'Prosthetist PreAuth Details' } }
    ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreAuthManagerRoutingModule { }

