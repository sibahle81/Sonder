import { DatePipe } from '@angular/common';
import { UntypedFormControl, UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { WizardConfigurationService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard-configuration.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardConfiguration } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-configuration';
import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';

import { WorkItem } from 'projects/digicare/src/app/work-manager/models/work-item';
import { WorkItemType } from 'projects/digicare/src/app/work-manager/models/work-item-type';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { WorkItemStateEnum } from 'projects/shared-models-lib/src/lib/enums/work-item-state.enum';
import { FirstMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-medical-report-form';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { DigiCareMasterDataService } from 'projects/digicare/src/app/digi-manager/services/digicare-master-data.service';
import { FinalDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-disease-medical-report-form';
import { ProgressDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-disease-medical-report-form';
import { FirstDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-disease-medical-report-form';
import { ReportFormType } from 'projects/digicare/src/app/digi-manager/Utility/report-form-type.util';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
  selector: 'app-work-item-selector',
  templateUrl: './work-item-selector.component.html',
  styleUrls: ['./work-item-selector.component.css']
})
export class WorkItemSelectorComponent implements OnInit {
  form: UntypedFormGroup;
  workItem: WorkItem;
  workItemTypes: WorkItemType[];
  selectedWorkType: WorkItemType;
  selectedWizardConfiguration: string;
  loadingWorkItemTypesInProgress = false;
  disableSave = false;
  tenant: Tenant;
  progressText = "";
  medicalReportCategories: any;
  isLoadingCategories = false;
  newWorkItemId: number;
  constructor(private readonly digiCareService: DigiCareService,
    private readonly digiCareMasterDataService: DigiCareMasterDataService,
    private readonly wizardService: WizardService,
    private readonly wizardConfigurationService: WizardConfigurationService,
    private readonly authorizationService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly formBuilder: UntypedFormBuilder,
    public datepipe: DatePipe,
    private readonly lookupService: LookupService,) { }

  ngOnInit() {
    //populate workitemtypes
    this.getWorkItemTypes();
    this.createForm();
    this.getCurrentTenant();
    this.getMedicalReportCategories()
  }

  createForm(): void {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      workItemTypeId: new UntypedFormControl('', [Validators.required])
    });
  }

  selected($event: any) {
    if ($event !== null) {
      this.selectedWorkType = $event.value;

      this.setWizardConfiguration();
      sessionStorage.removeItem('selectedReportTypeName')
      sessionStorage.setItem('selectedReportTypeName',$event.value)
    }
  }

  selectedReportCategory($event: any) {
    if ($event !== null) {
      sessionStorage.removeItem('selectedReportCategoryType')
      sessionStorage.setItem('selectedReportCategoryType',$event.value)
    }
  }

  //methods here

  getWorkItemTypes(): void {
    this.loadingWorkItemTypesInProgress = true;
    this.progressText = "Loading types...";
    this.workItemTypes = [];
    this.digiCareMasterDataService.getWorkItemTypes().subscribe(data => {
      this.workItemTypes = data;
      this.loadingWorkItemTypesInProgress = false;
    });

  }

  getMedicalReportCategories(): void {
    this.isLoadingCategories = true;
    this.medicalReportCategories = [];

    this.lookupService.getMedicalReportCategories().subscribe(data => {
      this.medicalReportCategories = data;
      this.isLoadingCategories = false;
    });

  }

  getCurrentTenant(): void {
    const user = this.authorizationService.getCurrentUser();
    this.userService.getTenant(user.email).subscribe(
      tenant => {
        this.tenant = tenant;
      }
    );
  }

  saveWorkItem() {
    this.loadingWorkItemTypesInProgress = true;
    this.progressText = "Loading...";
    this.disableSave = true;
    this.workItem = new WorkItem();
    const date = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
    this.workItem.workItemName = `${this.selectedWorkType.workItemTypeName} ${date}`;
    this.workItem.workItemType = this.selectedWorkType;
    this.workItem.workItemState = WorkItemStateEnum.InProgress;
    this.workItem.tenantId = this.tenant.id;

    this.digiCareService.addWorkItem(this.workItem).subscribe((workItemId) => {
      this.startWizard(workItemId);
      this.loadingWorkItemTypesInProgress = false;
    });
  }

  setWizardConfiguration() {
    this.wizardConfigurationService.getWizardConfiguration(this.selectedWorkType.wizardConfigurationId).subscribe(data => {
      this.getWizardConfigurationName(data);
    });
  }

  getWizardConfigurationName(wizardConfiguration: WizardConfiguration) {
    this.selectedWizardConfiguration = wizardConfiguration.name;
  }

  startWizard(newWorkItemId: number) {
    const startWizardRequest = new StartWizardRequest();
    this.setMedicalFormType(startWizardRequest, newWorkItemId);
    startWizardRequest.linkedItemId = newWorkItemId;
    startWizardRequest.type = this.selectedWizardConfiguration;

    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      ReportFormType.setReportFormType(wizard.wizardConfiguration.displayName);

      this.router.navigateByUrl(`digicare/work-manager/${this.selectedWizardConfiguration}/continue/${wizard.id}`);
    });
  }

  setMedicalFormType(startWizard: StartWizardRequest, newWorkItemId: number) {
    var specificMedicalReportForm;
    var reportTypeId = 0

    switch (this.selectedWorkType.wizardConfigurationId) {
      case 54:
        specificMedicalReportForm = new FirstMedicalReportForm();
        reportTypeId = MedicalFormReportTypeEnum.FirstAccidentMedicalReport;
        break;
      case 57:
        specificMedicalReportForm = new ProgressMedicalReportForm();
        reportTypeId = MedicalFormReportTypeEnum.ProgressAccidentMedicalReport;
        break;
      case 58:
        specificMedicalReportForm = new FinalMedicalReportForm();
        reportTypeId = MedicalFormReportTypeEnum.FinalAccidentMedicalReport;
        break;
      case 62: 
        specificMedicalReportForm = new FirstDiseaseMedicalReportForm();        
        reportTypeId = MedicalFormReportTypeEnum.FirstDiseaseMedicalReport;
        break;
      case 63:
        specificMedicalReportForm = new ProgressDiseaseMedicalReportForm();
        reportTypeId = MedicalFormReportTypeEnum.ProgressDiseaseMedicalReport;
        break;
      case 64:
        specificMedicalReportForm = new FinalDiseaseMedicalReportForm();
        reportTypeId = MedicalFormReportTypeEnum.FinalDiseaseMedicalReport;
        break;

      default: throw `The wizard configuration Id '${this.selectedWorkType.wizardConfigurationId}' is not recognised.`;

    }

    specificMedicalReportForm.medicalReportForm = new MedicalReportForm();
    specificMedicalReportForm.medicalReportForm.workItemId = newWorkItemId;
    specificMedicalReportForm.medicalReportForm.tenantId = 0;
    specificMedicalReportForm.medicalReportForm.reportTypeId = reportTypeId;

    startWizard.data = JSON.stringify(specificMedicalReportForm);
  }


  save(): void {
    this.form.controls.workItemTypeId.markAsTouched();
    if(this.selectedWorkType){
      this.saveWorkItem();
    }
  }

}
