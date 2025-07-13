import { DigiHomeComponent } from './Views/digi-home/digi-home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { DigiCareLayoutComponent } from './Views/digicare-layout/digicare-layout.component';
import { ClaimSearchComponent } from './Views/shared/claim-search/claim-search.component';
import { MedicalReportFormDeclarationComponent } from './Views/shared/medical-report-form-declaration/medical-report-form-declaration.component';

const routes: Routes = [
  {
    path: '', component: DigiCareLayoutComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { title: 'DigiCare Manager', permissions: ['Digi manager view']},
    children: [
      { path: '', component: DigiHomeComponent, data: { title: 'Home' } },
      { path: 'claim-search', component: ClaimSearchComponent, data: { title: 'Claim Search' } },
      { path: 'medical-report-form-declaration', component: MedicalReportFormDeclarationComponent, data: { title: 'Medical Report Form Declaration' } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class DigiManagerRoutingModule { }
