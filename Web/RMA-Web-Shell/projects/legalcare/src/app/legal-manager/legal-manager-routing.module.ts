import { LegalHomeComponent } from './views/legal-home/legal-home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { LegalCareLayoutComponent } from './views/legalcare-layout/legalcare-layout.component';
import { LegalAdminComponent } from './views/legal-admin/legal-admin.component';
import { LegalDetailsComponent } from './views/legal-details/legal-details.component';
import { LegalCollectionsAdminComponent } from './views/legal-collections-admin/legal-collections-admin.component';
import { LegalCollectionsDetailsComponent } from './views/legal-collections-details/legal-collections-details.component';
import { RecoveryLegalHeadComponent } from './views/recovery-legal-head/recovery-legal-head.component';
import { TribunalLegalAdvisorComponent } from './views/tribunal-legal-advisor/tribunal-legal-advisor.component';
import { TribunalLegalSecretaryComponent } from './views/tribunal-legal-secretary/tribunal-legal-secretary.component';
import { TribunalDetailsComponent } from './views/tribunal-details/tribunal-details.component';
import { RecoveryConsultantComponent } from './views/recovery-consultant/recovery-consultant.component';

const routes: Routes = [
  {
    path: '', component: LegalHomeComponent,
  },
  {
    path: 'legal-admin-view', component: LegalAdminComponent
  },
  {
    path: 'legal-admin-details', component: LegalDetailsComponent
  },
  {
    path: 'legal-collections-admin', component: LegalCollectionsAdminComponent
  },
  {
    path: 'legal-collections-details', component: LegalCollectionsDetailsComponent
  },
  {
    path: 'recovery-consultant', component: RecoveryConsultantComponent
  },
  {
    path: 'legal-legal-head', component: RecoveryLegalHeadComponent
  },
  {
    path: 'tribunal-legal-advisor', component: TribunalLegalAdvisorComponent
  },
  {
    path: 'tribunal-legal-secretary', component: TribunalLegalSecretaryComponent
  },
  {
    path: 'tribunal-legal-details', component: TribunalDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LegalManagerRoutingModule { }
