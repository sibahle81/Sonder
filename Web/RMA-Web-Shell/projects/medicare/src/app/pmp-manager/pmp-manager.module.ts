import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PMPManagerRoutingModule } from './pmp-manager-routing.module';
import { PMPScheduleWizard } from 'projects/medicare/src/app/pmp-manager/views/wizards/pmp-schedule-wizard/pmp-schedule-wizard.component';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { SearchPensionCaseComponent } from './views/search-pension-case/search-pension-case.component';
import { PMPMenuComponent } from './views/pmp-menu/pmp-menu.component';
import { ClaimCareSharedModule } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/claim-care-shared.module';
import { PMPScheduleDetailsComponent } from './views/pmp-schedule-details/pmp-schedule-details.component';
import { PMPVisitDetailsComponent } from './views/pmp-visit-details/pmp-visit-details.component';
import { PensionerInterviewFormComponent } from './views/pensioner-interview-form/pensioner-interview-form.component';
import { PensionerMedicalPlanViewerComponent } from './views/pensioner-medical-plan-viewer/pensioner-medical-plan-viewer.component';
import { PensionerInterRegionTransferComponent } from './views/pensioner-region-transfer/inter-region-transfer.component';
import { PensionerTransferHandoverInfoComponent } from './views/pensioner-region-transfer/pensioner-transfer-handover-info/pensioner-transfer-handover-info.component';
import { ClientCareSharedModule } from 'projects/clientcare/src/app/shared/clientcare.shared.module';
import { PensionCaseManagerModule } from 'projects/penscare/src/app/pensioncase-manager/pensioncase-manager.module';
import { MaterialsModule } from 'projects/shared-utilities-lib/src/lib/modules/materials.module';
import { FrameworkModule } from 'src/app/framework.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { HCPMemberModule } from '../healthcareprovider-register-manager/hcp-member/hcp-member.module';
import { MedicareSearchMenusComponent } from '../shared/components/medicare-search-menus/medicare-search-menus.component';
import { PensionerInterviewFormListComponent } from './views/pensioner-interview-form-list/pensioner-interview-form-list.component';
import { PensionerInterRegionTransferFormListComponent } from './views/pensioner-inter-region-transfer-form-list/pensioner-inter-region-transfer-form-list.component';

@NgModule({
  declarations: [
    SearchPensionCaseComponent,
    PMPScheduleDetailsComponent,
    PMPVisitDetailsComponent,
    PMPMenuComponent,
    PensionerInterviewFormComponent,
    PensionerInterRegionTransferComponent,
    PensionerTransferHandoverInfoComponent,
    PensionerMedicalPlanViewerComponent,
    PensionerInterviewFormListComponent,
    PensionerInterRegionTransferFormListComponent 
  ],
  imports: [
    PMPManagerRoutingModule,
    SharedComponentsLibModule,
    CommonModule,
    ClaimCareSharedModule,
    MaterialsModule,
    FrameworkModule,
    SharedModule,
    HCPMemberModule,
    ClientCareSharedModule,
    MedicareSearchMenusComponent,//Standalone component
    PensionCaseManagerModule
  ],
  exports: [
    PensionerMedicalPlanViewerComponent 
  ]
})

export class PMPManagerModule {
    constructor(componentFactoryResolver: ComponentFactoryResolver, contextFactory: WizardContextFactory) {
        contextFactory.addWizardContext(new PMPScheduleWizard(componentFactoryResolver), 'pmp-schedule');
    }
}
