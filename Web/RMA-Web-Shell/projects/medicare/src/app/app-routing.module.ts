
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { PreAuthWorkOverviewComponent } from 'projects/medicare/src/app/preauth-manager/views/preauth-work-overview/preauth-work-overview.component';
import { PreauthOverviewComponent } from 'projects/medicare/src/app/preauth-manager/views/preauth-overview/preauth-overview.component';
import { MedicareNotificationsComponent } from './shared/components/medicare-notifications/medicare-notifications.component';
import { MedicareClaimSearchComponent } from './shared/components/medicare-claimsearch/medicare-claimsearch.component';
import { WorkPoolContainerMedicalComponent } from './medi-manager/Views/workpools/work-pool-container-medical/work-pool-container-medical.component';
import { MediHomeComponent } from 'projects/medicare/src/app/medi-manager/views/medi-home/medi-home.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['MediCare view'] },
    children: [
      { path: '', component: MedicareNotificationsComponent },
      { path: 'medicare', component: MedicareNotificationsComponent },
      { path: 'medi-home', component: MediHomeComponent },
      { path: 'medicare-notifications', component: MedicareNotificationsComponent },
      { path: 'medi-manager', loadChildren: () => import('projects/medicare/src/app/medi-manager/medi-manager.module').then(m => m.MediManagerModule) },
      { path: 'work-manager', component: PreAuthWorkOverviewComponent },
      { path: 'preauth-manager', component: PreauthOverviewComponent },
      { path: 'hospital-visit-manager', loadChildren: () => import('projects/medicare/src/app/hospital-visit-manager/hospital-visit-manager.module').then(m => m.HospitalVisitManagerModule) },
      { path: 'work-pool-manager', component: WorkPoolContainerMedicalComponent },
      { path: 'treatment-preauth-manager', loadChildren: () => import('projects/medicare/src/app/preauth-treatment-manager/treatment-preauth.module').then(m => m.TreatmentPreauthModule) },
      { path: 'medical-report', loadChildren: () => import('projects/medicare/src/app/medical-reports-manager/medical-reports-manager.module').then(m => m.MedicalReportsManagerModule)},
      { path: 'medicare-claimsearch', component: MedicareClaimSearchComponent },
      { path: 'reports-manager', loadChildren: () => import('projects/medicare/src/app/medical-reports-manager/medical-reports-manager.module').then(m => m.MedicalReportsManagerModule)},
      { path: 'pmp-manager', loadChildren: () => import('projects/medicare/src/app/pmp-manager/pmp-manager.module').then(m => m.PMPManagerModule) },
      { path: 'hcp-member-manager', loadChildren: () => import('projects/medicare/src/app/healthcareprovider-register-manager/hcp-member-manager/hcp-member-manager.module')
        .then(m => m.HCPMemberManagerModule) },  
      { path: 'medical-invoice-manager',  loadChildren: () => import('projects/medicare/src/app/medical-invoice-manager/medical-invoice-manager.module').then(m => m.MedicalInvoiceManagerModule) },  
    
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class MediCareMainRoutingModule { }
