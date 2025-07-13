import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { SearchPensionCaseComponent } from './views/search-pension-case/search-pension-case.component';
import { PMPMenuComponent } from './views/pmp-menu/pmp-menu.component';
import { PensionerInterRegionTransferComponent } from './views/pensioner-region-transfer/inter-region-transfer.component';
import { PensionerInterviewFormComponent } from './views/pensioner-interview-form/pensioner-interview-form.component';
import { PensionerMedicalPlanViewerComponent } from './views/pensioner-medical-plan-viewer/pensioner-medical-plan-viewer.component';
import { WizardHostComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component';
import { WizardEntryGuard } from 'projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard';

const routes: Routes = [
  {
    path: '', component: PMPMenuComponent,
    canActivate: [SignInGuard, PermissionGuard],
    canActivateChild: [PermissionGuard],
    data: { title: 'PMP Manager' },
    children: [
      { path: 'search-pension-case', component: SearchPensionCaseComponent, data: { title: 'Home' } },
      { path: 'pensioner-medical-plan-viewer', component: PensionerMedicalPlanViewerComponent, data: { title: 'Pension Case ' } },
      { path: 'pensioner-medical-plan-viewer/:pensionCaseId/:pensionCaseNumber/:claimId/:crudActionType', component: PensionerMedicalPlanViewerComponent, data: { title: 'Pension Case ' } },
      { path: 'pensioner-interview-form/:pensionCaseId/:pensionCaseNumber/:claimId/:pensionerInterviewFormId/:crudActionType', component: PensionerInterviewFormComponent, data: { title: 'Pensioner Interview Form' } },
      { path: 'pensioner-inter-region-transfer/:pensionCaseId/:pensionCaseNumber/:claimId/:pmpRegionTransferId/:crudActionType', component: PensionerInterRegionTransferComponent, data: { title: 'Pensioner Region Transfer' } },
      { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent },//required for wizard routing
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class PMPManagerRoutingModule { }
