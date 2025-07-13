import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { MedicalFormsOverviewComponent } from 'projects/digicare/src/app/medical-form-manager/views/medical-forms-overview/medical-forms-overview.component';
import { MedicalFormViewerComponent } from 'projects/digicare/src/app/medical-form-manager/views/medical-form-viewer/medical-form-viewer.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Medical form manager view'] },
    children: [
      { path: 'medical-forms-manager', component: MedicalFormsOverviewComponent},
      { path: 'medical-form-viewer/:id', component: MedicalFormViewerComponent, data: { title: 'Medical form viewer' } }

    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicalFormManagerRoutingModule { }

