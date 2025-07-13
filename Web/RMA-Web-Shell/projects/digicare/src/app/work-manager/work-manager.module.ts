import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { NgModule, ComponentFactoryResolver } from '@angular/core';

import { SharedServicesLibModule } from 'projects/shared-services-lib/src/lib/shared-services-lib.module';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { SharedModule } from 'src/app/shared/shared.module';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { FrameworkModule } from 'src/app/framework.module';

import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';
import { DigiCareMasterDataService } from 'projects/digicare/src/app/digi-manager/services/digicare-master-data.service';

import { DigiManagerModule } from 'projects/digicare/src/app/digi-manager/digi-manager.module';
import { WorkManagerRoutingModule } from 'projects/digicare/src/app/work-manager/work-manager-routing.module';
import { WorkOverviewComponent } from 'projects/digicare/src/app/work-manager/views/work-overview/work-overview.component';
import { WorkItemSelectorComponent } from 'projects/digicare/src/app/work-manager/views/work-item-selector/work-item-selector.component';
import { WorkItemsListComponent } from 'projects/digicare/src/app/work-manager/views/work-items-list/work-items-list.component';
import { ProgressMedicalReportFormWizardContext } from 'projects/digicare/src/app/work-manager/views/wizards/progress-medical-report/progress-medical-report-form-wizard';
import { ProgressReportDetailsComponent } from 'projects/digicare/src/app/work-manager/views/wizards/progress-medical-report/progress-report-details/progress-report-details.component';
import { ClaimSearchComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/claim-search/claim-search.component';
import { FirstMedicalReportFormWizardContext } from 'projects/digicare/src/app/work-manager/views/wizards/first-medical-report/first-medical-report-form-wizard';
import { FinalMedicalReportFormWizardContext } from 'projects/digicare/src/app/work-manager/views/wizards/final-medical-report/final-medical-report-form-wizard';
import { FinalReportDetailsComponent } from 'projects/digicare/src/app/work-manager/views/wizards/final-medical-report/final-report-details/final-report-details.component';
import { FirstReportDetailsComponent } from 'projects/digicare/src/app/work-manager/views/wizards/first-medical-report/first-report-details/first-report-details.component';
import { MedicalReportFormDiagnosisComponent } from 'projects/digicare/src/app/digi-manager/Views/shared/medical-report-form-diagnosis/medical-report-form-diagnosis.component';
import { WorkItemSearchComponent } from 'projects/digicare/src/app/work-manager/views/work-item-search/work-item-search.component';
import { WorkItemsDataSource } from 'projects/digicare/src/app/work-manager/datasources/work-items.datasource';
import { ProgressDiseaseReportDetailsComponent } from 'projects/digicare/src/app/work-manager/views/wizards/progress-medical-report/progress-disease-report-details/progress-disease-report-details.component';
import { FirstDiseaseReportDetailsComponent } from 'projects/digicare/src/app/work-manager/views/wizards/first-medical-report/first-disease-report-details/first-disease-report-details.component';
import { FirstDiseaseReportOccupationImpactDetailsComponent } from 'projects/digicare/src/app/work-manager/views/wizards/first-medical-report/first-disease-report-occupation-impact-details/first-disease-report-occupation-impact-details.component';
import { FirstDiseaseReportPtsdDetailsComponent } from 'projects/digicare/src/app/work-manager/views/wizards/first-medical-report/first-disease-report-ptsd-details/first-disease-report-ptsd-details.component';
import { FinalDiseaseReportDetailsComponent } from 'projects/digicare/src/app/work-manager/views/wizards/final-medical-report/final-disease-report-details/final-disease-report-details.component';
import { ProgressDiesaseMedicalReportFormWizardContext } from 'projects/digicare/src/app/work-manager/views/wizards/progress-medical-report/progress-disease-medical-report-form-wizard';
import { FirstDiseaseMedicalReportFormWizardContext } from 'projects/digicare/src/app/work-manager/views/wizards/first-medical-report/first-disease-medical-report-form-wizard';
import { FinalDiseaseMedicalReportFormWizardContext } from 'projects/digicare/src/app/work-manager/views/wizards/final-medical-report/final-disease-medical-report-form-wizard';
import { WorkItemMenuComponent } from 'projects/digicare/src/app/work-manager/views/work-item-menu/work-item-menu.component';

@NgModule({
    imports: [
        FrameworkModule,
        WorkManagerRoutingModule,
        WizardModule,
        SharedModule,
        FormsModule,
        MatSelectModule,
        MatInputModule,
        DigiManagerModule
    ],
    declarations: [
        WorkOverviewComponent,
        WorkItemSelectorComponent,
        WorkItemsListComponent,
        MedicalReportFormDiagnosisComponent,
        FirstReportDetailsComponent,
        ProgressReportDetailsComponent,
        FinalReportDetailsComponent,
        ClaimSearchComponent,
        WorkItemSearchComponent,
        FirstDiseaseReportDetailsComponent,
        FirstDiseaseReportOccupationImpactDetailsComponent,
        FirstDiseaseReportPtsdDetailsComponent,
        ProgressDiseaseReportDetailsComponent,
        FinalDiseaseReportDetailsComponent,
        WorkItemMenuComponent
    ],
    exports: [],
    entryComponents: [
      MedicalReportFormDiagnosisComponent,
      FirstReportDetailsComponent,
      ProgressReportDetailsComponent,
      FinalReportDetailsComponent,
      ClaimSearchComponent,
      FirstDiseaseReportDetailsComponent,
      FirstDiseaseReportOccupationImpactDetailsComponent,
      FirstDiseaseReportPtsdDetailsComponent,
      ProgressDiseaseReportDetailsComponent,
      FinalDiseaseReportDetailsComponent
    ],
    providers: [
        SharedServicesLibModule,
        DigiCareService,
        DigiCareMasterDataService,
        WorkItemsDataSource
    ],
    bootstrap: []
})
export class WorkManagerModule {
  constructor(componentFactoryResolver: ComponentFactoryResolver, contextFactory: WizardContextFactory) {
    // register the context factories used in the wizard controls
    contextFactory.addWizardContext(new FirstMedicalReportFormWizardContext(componentFactoryResolver), 'first-medical-report-form');
    contextFactory.addWizardContext(new ProgressMedicalReportFormWizardContext(componentFactoryResolver), 'progress-medical-report-form');
    contextFactory.addWizardContext(new FinalMedicalReportFormWizardContext(componentFactoryResolver), 'final-medical-report-form');
    contextFactory.addWizardContext(new FirstDiseaseMedicalReportFormWizardContext(componentFactoryResolver), 'first-disease-medical-report-form');
    contextFactory.addWizardContext(new ProgressDiesaseMedicalReportFormWizardContext(componentFactoryResolver), 'progress-disease-medical-report-form');
    contextFactory.addWizardContext(new FinalDiseaseMedicalReportFormWizardContext(componentFactoryResolver), 'final-disease-medical-report-form');
  }

}

