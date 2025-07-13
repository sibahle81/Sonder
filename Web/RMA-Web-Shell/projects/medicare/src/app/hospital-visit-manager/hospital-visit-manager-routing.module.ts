import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CaptureHospitalVisitComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/capture-hospital-visit/capture-hospital-visit.component';
import { ListHospitalVisitComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/list-hospital-visit/list-hospital-visit.component';
import { ViewHospitalVisitComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/view-hospital-visit/view-hospital-visit.component';
import { ClinicalUpdateBreakdownViewComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/clinical-update-breakdown-view/clinical-update-breakdown-view.component';

import { ReviewHospitalVisitComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/review-hospital-visit/review-hospital-visit.component'; 
import { EditHospitalVisitComponent } from 'projects/medicare/src/app/hospital-visit-manager/views/edit-hospital-visit/edit-hospital-visit.component';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';

const routes: Routes = [
  { path: '', redirectTo: 'hospital-visits', pathMatch: 'full'},
  { path: 'hospital-visits', component: ListHospitalVisitComponent, canActivate:[PermissionGuard ], data: { permissions: ['Hospital visit manager view']}},
  { path: 'clinical-updates/view/:id', component: ClinicalUpdateBreakdownViewComponent, canActivate:[PermissionGuard ], data: { permissions: ['Hospital visit manager view']}  },
  { path: 'hospital-visits/review/:id', component: ReviewHospitalVisitComponent, canActivate:[PermissionGuard ], data: { permissions: ['Hospital visit manager view']}},
  { path: 'hospital-visits/edit/:id', component: EditHospitalVisitComponent, canActivate:[PermissionGuard ], data: { permissions: ['Hospital visit manager view']} },
  { path: ':action/:type/:linkedId', component: CaptureHospitalVisitComponent, canActivate:[PermissionGuard ], data: { permissions: ['Hospital visit manager view']}},
  //{ path: 'hospital-visits/view', component: ViewHospitalVisitComponent  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HospitalVisitManagerRoutingModule { }