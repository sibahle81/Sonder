
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { MonthEndLayoutComponent } from './views/month-end-layout/month-end-layout.component';
import { MonthEndDatesViewComponent } from './views/month-end-dates-view/month-end-dates-view.component';
import { MonthEndDatesComponent } from './views/month-end-dates/month-end-dates.component';
import { MonthEndHistoryComponent } from './views/month-end-history/month-end-history.component';
import { MonthEndIrp5Component } from './views/month-end-irp5/month-end-irp5.component';

const routes: Routes = [
  {
    path: '', component: MonthEndLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Month-end view'] },
    children: [
      { path: '', component: MonthEndDatesComponent, data: { title: 'Month End Run Dates' } },
      { path: 'home', component: MonthEndDatesComponent, data: { title: 'Month End Run Dates' } },
      { path: 'month-end-history', component: MonthEndHistoryComponent, data: { title: 'Month End History' } },
      { path: 'month-end-irp5', component: MonthEndIrp5Component, data: { title: 'Generate IRP5 Document' } },
      { path: 'month-end/view-monthend-rundates/:id', component: MonthEndDatesViewComponent, data: { title: 'Month End Run Details' } },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class MonthEndRoutingModule { }
