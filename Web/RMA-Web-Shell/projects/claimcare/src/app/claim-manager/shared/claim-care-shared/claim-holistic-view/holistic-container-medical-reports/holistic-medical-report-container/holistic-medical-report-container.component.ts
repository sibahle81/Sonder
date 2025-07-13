import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { EventTypeEnum } from '../../../../enums/event-type-enum';
import { Constants } from '../../../../../../constants';
import { FirstMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-medical-report-form';
import { FirstDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-disease-medical-report-form';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { BehaviorSubject } from 'rxjs';
import { WorkItemStateEnum } from 'projects/shared-models-lib/src/lib/enums/work-item-state.enum';
import { WorkItem } from 'projects/digicare/src/app/work-manager/models/work-item';
import { WorkItemType } from 'projects/digicare/src/app/work-manager/models/work-item-type';
import { DatePipe } from '@angular/common';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { EventModel } from '../../../../entities/personEvent/event.model';
import { HolisticFirstMedicalReportsComponent } from '../holistic-first-medical-reports/holistic-first-medical-reports.component';
import { HolisticProgressMedicalReportsComponent } from '../holistic-progress-medical-reports/holistic-progress-medical-reports.component';
import { HolisticFinalMedicalReportsComponent } from '../holistic-final-medical-reports/holistic-final-medical-reports.component';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { ICD10EstimateFilter } from 'projects/shared-models-lib/src/lib/common/icd10-estimate-filter';
import { Icd10CodeEstimateAmount } from 'projects/shared-models-lib/src/lib/common/icd10-code-estimate-amount';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ManageUser } from '../../../../entities/funeral/work-pool.model';
import { SourceSystemEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { ClaimAdditionalRequiredDocument } from '../../../../entities/claim-additional-required-document';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';
import { HolisticSickNoteMedicalReportsComponent } from '../holistic-sicknote-medical-reports/holistic-sicknote-medical-reports.component';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'holistic-medical-report-container',
  templateUrl: './holistic-medical-report-container.component.html',
  styleUrls: ['./holistic-medical-report-container.component.css']
})
export class HolisticMedicalReportContainerComponent extends UnSubscribe implements OnChanges {
  @Input() personEvent: PersonEventModel;
  @Input() event: EventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;

  @Output() refreshClaimEmit: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('firstMedicalComponent') private firstMedicalComponent: HolisticFirstMedicalReportsComponent;
  @ViewChild('progressMedicalComponent') private progressMedicalComponent: HolisticProgressMedicalReportsComponent;
  @ViewChild('finalMedicalComponent') private finalMedicalComponent: HolisticFinalMedicalReportsComponent;
  @ViewChild('sickNoteMedicalComponent') private sickNoteMedicalComponent: HolisticSickNoteMedicalReportsComponent;

  isDisabled: boolean;
  canCaptureFirstMedicalReport: boolean;
  documentTypeAccepted: boolean;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  icd10CodesEstimatesAmounts: Icd10CodeEstimateAmount[] = [];
  pdpercentage: number[] = [];
  personEventICT10COde: ICD10Code;
  tenant: Tenant;
  isAccident = false;
  claimId: number;
  accident = EventTypeEnum.Accident;
  disease = EventTypeEnum.Disease;
  users: User[];
  availableUsers: User[];
  bookedOffUsers: ManageUser[];
  selectedIndustryClass: IndustryClassEnum;
  additionalRequiredDocuments: ClaimAdditionalRequiredDocument[] = [];
  filterRequiredDocuments: DocumentTypeEnum[] = [];
  canVerify = 'Verify PD Percentage';
  hasSCAPermission = false;
  public icd10CodeFilters: ICD10EstimateFilter[] = [];
  selectedDocuments: GenericDocument[] = [];

  documentUploadStatus = DocumentStatusEnum.Accepted;
  triggerRefresh: boolean;
  triggerSelectedTab = 0;

  constructor(
    private readonly digiCareService: DigiCareService,
    private readonly alertService: AlertService,
    private readonly wizardService: WizardService,
    private datePipe: DatePipe,
    private readonly authorizationService: AuthService,
    private readonly userService: UserService,
    private readonly claimService: ClaimCareService,
    private readonly documentManagementService: DocumentManagementService,

  ) {
    super();
    this.getCurrentTenant();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isWizard) {
      this.getEvent();
    } else {
        this.isLoading$.next(false);
    }
  }

  getEvent() {
    if(!this.event) {
      this.claimService.getEventDetails(this.personEvent.eventId).subscribe(result => {
        this.event = result;
        this.isLoading$.next(false);
      });
    } else {
      this.isLoading$.next(false);
    }
  }

  public sendForCapturing(): void {
    if (this.documentTypeAccepted) {
      this.createDigiCareReport();
    } else {
      this.alertService.loading('Please Accept First Medical Report');
    }
  }

  private createDigiCareReport() {
    const workItem = this.createDigiCareWorkItem(EventTypeEnum.Accident ? MedicalFormReportTypeEnum.FirstAccidentMedicalReport : MedicalFormReportTypeEnum.FirstDiseaseMedicalReport);

    this.digiCareService.addWorkItem(workItem).subscribe((workItemId) => {
      this.startWizard(workItemId);
    });
  }

  private startWizard(workItemId: number) {
    let startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = this.event.eventType === EventTypeEnum.Accident ? Constants.digiCareMedicalFormAccidentWizard : Constants.digiCareMedicalFormDiseaseWizard;
    startWizardRequest = this.setMedicalFormType(startWizardRequest, workItemId);
    startWizardRequest.linkedItemId = this.personEvent.personEventId;
    this.createWizard(startWizardRequest);
  }

  private setMedicalFormType(startWizard: StartWizardRequest, workItemId: number): StartWizardRequest {
    let specificMedicalReportForm;

    switch (startWizard.type) {
      case Constants.digiCareMedicalFormAccidentWizard:
        specificMedicalReportForm = new FirstMedicalReportForm();
        specificMedicalReportForm.medicalReportForm = new MedicalReportForm();
        specificMedicalReportForm.medicalReportForm.reportTypeId = MedicalFormReportTypeEnum.FirstAccidentMedicalReport;
        break;
      case Constants.digiCareMedicalFormDiseaseWizard:
        specificMedicalReportForm = new FirstDiseaseMedicalReportForm();
        specificMedicalReportForm.medicalReportForm = new MedicalReportForm();
        specificMedicalReportForm.medicalReportForm.reportTypeId = MedicalFormReportTypeEnum.FirstDiseaseMedicalReport;
        break;

      default: throw new Error(`not found`);

    }
    specificMedicalReportForm.medicalReportSystemSource = SourceSystemEnum.Modernisation;
    specificMedicalReportForm.medicalReportForm.workItemId = workItemId;
    specificMedicalReportForm.medicalReportForm.tenantId = 0;
    specificMedicalReportForm.medicalReportForm.medicalReportSystemSource = SourceSystemEnum.Modernisation;
    specificMedicalReportForm.medicalReportForm.personEventId = this.personEvent.personEventId;

    startWizard.data = JSON.stringify(specificMedicalReportForm);
    return startWizard;
  }

  private createWizard(startWizardRequest: StartWizardRequest): void {
    this.wizardService.startWizard(startWizardRequest).subscribe((result) => {
      this.alertService.success(startWizardRequest.type + ' wizard started successfully');

    });
  }

  setIsDisabled($event: boolean) {
    this.isDisabled = $event;
  }

  setCanCapture($event: boolean) {
    this.canCaptureFirstMedicalReport = $event;
  }

  private createDigiCareWorkItem(medicalFormReportType: MedicalFormReportTypeEnum): WorkItem {
    const workItem = new WorkItem();
    const workItemType = new WorkItemType();
    const date = this.datePipe.transform(new Date(), Constants.dateString);

    switch (medicalFormReportType) {
      case MedicalFormReportTypeEnum.FirstAccidentMedicalReport:
        workItemType.wizardConfigurationId = Constants.digiCareFirstMedicalWizardConfigurationIdAccident;
        workItemType.workItemTypeDescription = Constants.digiCareFirstMedicalReportAccident;
        workItemType.workItemTypeId = Constants.digiCareFirstMedicalItemTypeAccident;
        workItemType.workItemTypeName = Constants.digiCareFirstMedicalReportAccident;
        workItem.workItemName = `${Constants.digiCareFirstMedicalReportAccident} ${date} - ${this.personEvent.personEventId}`;
        break;
      case MedicalFormReportTypeEnum.ProgressAccidentMedicalReport:
        workItemType.wizardConfigurationId = Constants.digiCareProgressMedicalWizardConfigurationIdAccident;
        workItemType.workItemTypeDescription = Constants.digiCareProgressMedicalReportAccident;
        workItemType.workItemTypeId = Constants.digiCareProgressMedicalItemTypeAccident;
        workItemType.workItemTypeName = Constants.digiCareProgressMedicalReportAccident;
        workItem.workItemName = `${Constants.digiCareProgressMedicalReportAccident} ${date} - ${this.personEvent.personEventId}`;
        break;
      case MedicalFormReportTypeEnum.FinalAccidentMedicalReport:
        workItemType.wizardConfigurationId = Constants.digiCareFinalMedicalWizardConfigurationIdAccident;
        workItemType.workItemTypeDescription = Constants.digiCareFinalMedicalReportAccident;
        workItemType.workItemTypeId = Constants.digiCareFinalMedicalItemTypeAccident;
        workItemType.workItemTypeName = Constants.digiCareFinalMedicalReportAccident;
        workItem.workItemName = `${Constants.digiCareFinalMedicalReportAccident} ${date} - ${this.personEvent.personEventId}`;
        break;
      case MedicalFormReportTypeEnum.FirstDiseaseMedicalReport:
        workItemType.wizardConfigurationId = Constants.digiCareFirstMedicalWizardConfigurationIdDisease;
        workItemType.workItemTypeDescription = Constants.digiCareFirstMedicalReportDisease;
        workItemType.workItemTypeId = Constants.digiCareFirstMedicalItemTypeDisease;
        workItemType.workItemTypeName = Constants.digiCareFirstMedicalReportDisease;
        workItem.workItemName = `${Constants.digiCareFirstMedicalReportDisease} ${date} - ${this.personEvent.personEventId}`;
        break;
      case MedicalFormReportTypeEnum.ProgressDiseaseMedicalReport:
        workItemType.wizardConfigurationId = Constants.digiCareProgressMedicalWizardConfigurationIdDisease;
        workItemType.workItemTypeDescription = Constants.digiCareProgressMedicalReportDisease;
        workItemType.workItemTypeId = Constants.digiCareProgressMedicalItemTypeDisease;
        workItemType.workItemTypeName = Constants.digiCareProgressMedicalReportDisease;
        workItem.workItemName = `${Constants.digiCareProgressMedicalReportDisease} ${date} - ${this.personEvent.personEventId}`;
        break;
      case MedicalFormReportTypeEnum.FinalAccidentMedicalReport:
        workItemType.wizardConfigurationId = Constants.digiCareFinalMedicalWizardConfigurationIdDisease;
        workItemType.workItemTypeDescription = Constants.digiCareFinalMedicalReportDisease;
        workItemType.workItemTypeId = Constants.digiCareFinalMedicalItemTypeDisease;
        workItemType.workItemTypeName = Constants.digiCareFinalMedicalReportDisease;
        workItem.workItemName = `${Constants.digiCareFinalMedicalReportDisease} ${date} - ${this.personEvent.personEventId}`;
        break;
    }
    workItem.workItemType = workItemType;
    workItem.workItemState = WorkItemStateEnum.InProgress;
    workItem.tenantId = this.tenant.id;
    return workItem;
  }

  getCurrentTenant(): void {
    const user = this.authorizationService.getCurrentUser();
    this.userService.getTenant(user.email).subscribe(
      tenant => {
        this.tenant = tenant;
      }
    );
  }

  public checkReportInDigiCare(data: any) {
    if (data.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.FirstAccidentMedicalReport) {
      this.firstMedicalComponent.getFirstMedicalReportForm();
    }
    if (data.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.SickNoteMedicalReport) {
      this.sickNoteMedicalComponent.getSickNoteMedicalReportForm();
    }
    if (data.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.ProgressAccidentMedicalReport) {
      this.progressMedicalComponent.getProgressMedicalReportForm();
    }
    if (data.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.FinalAccidentMedicalReport) {
      this.finalMedicalComponent.getFinalMedicalReportForm();
    }
  }

  // todo: verify sca permission
  verifySCAPermission() {
    this.hasSCAPermission = this.userHasPermission('Sca Pool')
  }

  getCCAUsers() {
    this.userService.getUsersByPermission('Cca Pool').subscribe(result => {
      if (result) {
        this.availableUsers = result;
        this.bookedOffUsers = this.getBookedOffUsers();
        this.filterAvailableUsers();
      }
    })
  }

  getBookedOffUsers(): ManageUser[] {
    return null;

  }

  filterAvailableUsers() {
    this.bookedOffUsers.forEach(a => {
      let index = this.availableUsers.findIndex(b => b.id === a.rolePlayerId);

      if (index > -1) {
        this.availableUsers.splice(index, 1)
      }
    })
  }

  getMedicalEstimates(icd10Codes: ICD10Code[], $event: any) {
    icd10Codes.forEach(icd10Code => {
      this.icd10CodeFilters.push(this.ICD10EstimateFilters(icd10Code));
    });
    this.claimService
      .GetICD10PDPercentageEstimates(this.icd10CodeFilters, icd10Codes[0].severity)
      .subscribe((pdPercentage) => {
        if (pdPercentage === 0) {
          this.isLoading$.next(true);
          if (this.personEvent.isStraightThroughProcess && ($event[0]?.documentStatus && $event[0]?.documentStatus !== DocumentStatusEnum.Accepted)) {
            $event[0].documentStatus = DocumentStatusEnum.Accepted;
            this.documentManagementService.updateDocumentGeneric($event[0]).subscribe(result => {
              this.isLoading$.next(false);
            })
          } else {
            this.isLoading$.next(false);
          }
        }
      });
  }

  ICD10EstimateFilters(icd10Codes: ICD10Code): ICD10EstimateFilter {
    const icd10CodeFilter: ICD10EstimateFilter = {
      eventType: this.event.eventType,
      icd10Codes: icd10Codes.icd10Code,
      reportDate: new Date(this.personEvent.firstMedicalReport.medicalReportForm.reportDate),
      icd10DiagnosticGroupId: 0
    };
    return icd10CodeFilter;
  }

  refreshEmit($event: boolean) {
    this.refreshClaimEmit.emit(true);
  }

  onTabChange(event) {
    this.triggerSelectedTab = event.index + 1;
    this.triggerRefresh = true;
  }
}
