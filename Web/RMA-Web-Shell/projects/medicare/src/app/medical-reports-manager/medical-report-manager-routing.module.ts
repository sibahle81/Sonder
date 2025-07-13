import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { MedicalReportHomeComponent } from './views/medical-report-home/medical-report-home.component';
import { MedicalReportLayoutComponent } from './views/medical-report-layout/medical-report-layout.component';
import { MedicalReportViewComponent } from './views/medical-report-holistic/medical-report-view.component';
import { MedicalReportsManagerComponent } from './views/medical-reports-manager/medical-reports-manager.component';


const routes: Routes = [
  {
    path: '', component: MedicalReportLayoutComponent, 
    canActivate: [SignInGuard, PermissionGuard], 
    canActivateChild: [PermissionGuard],
    data: { title: 'Medical Report Manager' },
    children: [
      { path: '', component: MedicalReportHomeComponent, data: { title: 'Medical Report Manager' } },
      { path: 'pmp-reports', component: MedicalReportsManagerComponent, data: { title: 'PMP Reports', permissions: ['MediCare Reports Manager'] } },  
      { path: 'report-view', component: MedicalReportViewComponent, data: { title: 'Create Report' } },
      { path: 'report-view/:isClaimView/:mode/:medicalReportId', component: MedicalReportViewComponent, data: { title: 'Manage Report' } },
      { path: 'report-view/:isClaimView/:medicalReportId/:claimId/:healthCareProviderId', component: MedicalReportViewComponent, data: { title: 'Manage or Create Report' } },
       ]
  }];

@NgModule({
  imports: [
    RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class  MedicalReportManagerRoutingModule { }