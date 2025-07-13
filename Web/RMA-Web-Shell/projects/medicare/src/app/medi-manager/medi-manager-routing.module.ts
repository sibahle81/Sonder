import { MediHomeComponent } from './views/medi-home/medi-home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { ViewSearchResultsComponent } from './Views/shared/view-search-results/view-search-results.component';
import { MedicareNotificationsComponent } from '../shared/components/medicare-notifications/medicare-notifications.component';
import { MediCareLayoutComponent } from './Views/medicare-layout/medicare-layout.component';
import { PreAuthWorkpoolComponent } from './Views/shared/preauth-workpool/preauth-workpool.component';
import { PreauthWorkItemsListComponent } from './Views/preauth-work-items-list/preauth-work-items-list.component';
import { TebaInvoiceListComponent } from './Views/shared/teba-invoice-list/teba-invoice-list.component';

const routes: Routes = [
  {
    path: '', component: MediCareLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { title: 'MediCare Manager', permissions: ['Medi manager view'] },
    children: [
      { path: '', component: MedicareNotificationsComponent },
      { path: 'medicare', component: MedicareNotificationsComponent },
      { path: 'medi-home', component: MediHomeComponent },
      { path: 'medicare-notifications', component: MedicareNotificationsComponent },
      { path: 'view-search-results/:id', component: ViewSearchResultsComponent, data: { title: 'View Search Results' } },
      { path: 'view-search-results/:id/:searchedPreauthType/:selectedPreAuthId', component: ViewSearchResultsComponent, data: { title: 'View Search Results' } }
    ]
  },
  {
    path: 'preauth-workpool',
    component: PreAuthWorkpoolComponent
  },
  {
    path: 'incomplete-work-item-list',
    component: PreauthWorkItemsListComponent
  },
  {
    path: 'teba-invoice-list',
    component: TebaInvoiceListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class MediManagerRoutingModule { }
