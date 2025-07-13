import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';
import { FirstDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-disease-medical-report-form';
import { FirstMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-medical-report-form';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { WorkItem } from 'projects/digicare/src/app/work-manager/models/work-item';
import { WorkItemType } from 'projects/digicare/src/app/work-manager/models/work-item-type';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';
import { WorkItemStateEnum } from 'projects/shared-models-lib/src/lib/enums/work-item-state.enum';
import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { Constants } from '../../../constants';
import { EventModel } from '../../shared/entities/personEvent/event.model';
import { PersonEventModel } from '../../shared/entities/personEvent/personEvent.model';
import { EventTypeEnum } from '../../shared/enums/event-type-enum';
import { ClaimAccidentDocumentComponent } from '../../shared/claim-care-shared/claim-accident-document/claim-accident-document.component';
import { ClaimCareService } from '../../Services/claimcare.service';
import { BehaviorSubject } from 'rxjs';
import { FirstMedicalReportComponent } from 'projects/shared-components-lib/src/lib/first-medical-report/first-medical-report.component';
import { AccidentService } from '../../Services/accident.service';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { ProgressMedicalReportComponent } from 'projects/shared-components-lib/src/lib/progress-medical-report/progress-medical-report.component';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { FinalMedicalReportComponent } from 'projects/shared-components-lib/src/lib/final-medical-report/final-medical-report.component';
import { MedicalReportFormWizardDetail } from '../../shared/entities/medical-report-form-wizard-detail';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { takeUntil } from 'rxjs/operators';
import { SourceSystemEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';
@Component({
  selector: 'claim-notification-documents',
  templateUrl: './claim-notification-documents.component.html',
  styleUrls: ['./claim-notification-documents.component.css']
})
export class ClaimNotificationDocumentsComponent extends UnSubscribe implements OnInit, OnChanges {

  @Input() event: EventModel;
  @Input() isWizard: boolean;
  @Input() isReadOnly = false;
  @Input() triggerRefresh = false;

  @Output() onRefreshParentRequired = new EventEmitter<boolean>();

  @ViewChild(MatTable, { static: false }) table: MatTable<RolePlayer>;
  @ViewChild('claimAccidentDocumentComponent', { static: false }) public claimAccidentDocumentComponent: ClaimAccidentDocumentComponent;
  @ViewChild(MatPaginator, { static: false }) set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  dataSource: MatTableDataSource<PersonEventModel>;

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isLoadingFirstMedicalReports$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isLoadingProgressMedicalReports$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isLoadingFinalMedicalReports$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  medicalDisplayedColumns = ['healthcareProviderName', 'healthcareProviderPracticeNumber', 'icd10Codes', 'actions'];
  medicalReportDetails = [];
  progressMedicalReportDetails = [];
  finalMedicalReportDetails = [];
  showFirstMedicalReportTable = false;
  showProgressMedicalReportTable = false;
  showFinalMedicalReportTable = false;
  menus: { title: string, action: string, disable: boolean }[];
  firstMedicalMenus: { title: string, action: string, disable: boolean }[];
  progressMedicalMenus: { title: string, action: string, disable: boolean }[];
  finalMedicalMenus: { title: string, action: string, disable: boolean }[];

  @Output() isValidEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() isPristineEmit: EventEmitter<boolean> = new EventEmitter();

  hasPermission: boolean;
  requiredPermission = '';
  isViewMode: boolean;
  showTable: boolean;
  viewSelectedDocuments: boolean;
  selectedPersonEvent: PersonEventModel;
  selectedProgressReport: ProgressMedicalReportForm;
  selectedFinalReport: FinalMedicalReportForm;
  isDisabled: boolean;
  isFirstMedicalDisabled: boolean;
  isAccident: boolean;
  tenant: Tenant;
  canCaptureFirstMedicalReport: boolean;
  canCaptureProgressMedicalReport: boolean;
  canCaptureFinalMedicalReport: boolean;
  isStraigthThroughProcess: boolean;
  firstMedicalReportForm: FirstMedicalReportForm;

  constructor(
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService,
    private datepipe: DatePipe,
    private readonly authorizationService: AuthService,
    private readonly userService: UserService,
    private readonly digiCareService: DigiCareService,
    private readonly claimService: ClaimCareService,
    private readonly accidentService: AccidentService,
    private readonly router: Router,
    public dialog: MatDialog
  ) { super()}

  ngOnInit() {
    this.hasPermission = this.checkPermissions(this.requiredPermission);
    this.getCurrentTenant();
    if (this.isReadOnly) {
      this.checkIfWizardExsits();
      this.checkIfFirstMedicalReportExsits();
      this.checkIfProgressMedicalReportExsits();
      this.checkIfFinalMedicalReportExsits();
      if (this.event.personEvents[0].isStraightThroughProcess && (this.event.personEvents[0].claims[0].claimStatus === ClaimStatusEnum.AutoAcknowledged ||
        this.event.personEvents[0].claims[0].claimStatus === ClaimStatusEnum.ClaimClosed ||
        this.event.personEvents[0].claims[0].claimStatus === ClaimStatusEnum.Finalized)
        && this.event.personEvents[0].claims[0].claimLiabilityStatus
        && (this.event.personEvents[0].claims[0].claimLiabilityStatus === ClaimLiabilityStatusEnum.LiabilityAccepted
          || this.event.personEvents[0].claims[0].claimLiabilityStatus === ClaimLiabilityStatusEnum.Accepted)
      ) {
        this.canCaptureProgressMedicalReport = true;
        this.canCaptureFinalMedicalReport = true;
      }
    }
    if (this.isWizard) {
      this.isViewMode = true;
    }
    this.isAccident = this.event.eventType === EventTypeEnum.Accident;
    if(this.router.url.includes('holistic-claim-view')){
      this.viewSelectedDocuments = true;
    }
  }

  checkIfWizardExsits() {
    this.wizardService.getWizardsByTypeAndLinkedItemId(this.event.personEvents[0].personEventId,
      this.event.eventType === EventTypeEnum.Accident ? Constants.digiCareMedicalFormAccidentWizard : Constants.digiCareMedicalFormDiseaseWizard).subscribe((result) => {
        this.isDisabled = result ? true : false;
      });
  }

  checkIfFirstMedicalReportExsits() {
    this.isLoadingFirstMedicalReports$.next(true);
    this.accidentService.GetFirstMedicalReportForms(this.event.personEvents[0].personEventId).pipe(takeUntil(this.unSubscribe$)).subscribe((firstMedicalReport) => {
      if (firstMedicalReport.length !== 0) {
        this.firstMedicalReportForm = firstMedicalReport[0];
        this.canCaptureFirstMedicalReport = firstMedicalReport ? false : true;
        this.medicalReportDetails = firstMedicalReport;
        this.showFirstMedicalReportTable = true;
        this.isLoadingFirstMedicalReports$.next(false);
      } else {
        this.isLoadingFirstMedicalReports$.next(false);
      }
    }, (error) => {
      this.isLoadingFirstMedicalReports$.next(false);
    });
  }

  checkIfProgressMedicalReportExsits() {
    this.isLoadingProgressMedicalReports$.next(true);
    this.accidentService.GetProgressMedicalReportForms(this.event.personEvents[0].personEventId).pipe(takeUntil(this.unSubscribe$)).subscribe((progressMedicalReports) => {
      if (progressMedicalReports.length !== 0) {
        this.progressMedicalReportDetails = [];
        this.progressMedicalReportDetails = progressMedicalReports;
        this.showProgressMedicalReportTable = true;
        this.isLoadingProgressMedicalReports$.next(false);
      } else {
        this.isLoadingProgressMedicalReports$.next(false);
      }
    }, (error) => {
      this.isLoadingProgressMedicalReports$.next(false);
    });
  }

  checkIfFinalMedicalReportExsits() {
    this.isLoadingFinalMedicalReports$.next(true);
    this.accidentService.GetFinalMedicalReportForms(this.event.personEvents[0].personEventId).pipe(takeUntil(this.unSubscribe$)).subscribe((finalMedicalReports) => {
      if (finalMedicalReports.length !== 0) {
        this.finalMedicalReportDetails = [];
        this.finalMedicalReportDetails = finalMedicalReports;
        this.showFinalMedicalReportTable = true;
        this.isLoadingFinalMedicalReports$.next(false);
      } else {
        this.isLoadingFinalMedicalReports$.next(false);
      }
    }, (error) => {
      this.isLoadingFinalMedicalReports$.next(false);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.event) { return; }
    this.dataSource = new MatTableDataSource(this.event.personEvents);
    this.dataSource.paginator = this.paginator;
    this.getEmployeeDetails();
    this.event = this.event;
  this.claimService.EmployeeListChange$.pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
      if (result) {
        this.getEmployeeDetails();
      }
    }, (error) => {
      this.alertService.error(error);
    });

    this.claimService.EmployeeListChange$.pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
      if (result) {
        this.getEmployeeDetails();
      }
    });
  }

  checkPermissions(permission: string): boolean {
    // return userUtility.hasPermission(permission);
    return true;
  }

  getEmployeeDetails() {
    if (this.event.personEvents.length > 0) {
      this.event.personEvents.forEach(personEvent => {
        if (personEvent.rolePlayer.person) {
          this.updateTable(true);
        }
      });
    } else {
      this.dataSource.data = [];
    }
  }

  getCurrentTenant(): void {
    const user = this.authorizationService.getCurrentUser();
    this.userService.getTenant(user.email).subscribe(
      tenant => {
        this.tenant = tenant;
      }
    );
  }

  updateTable(isFromGetEmployee: boolean) {
    this.dataSource.data = this.event.personEvents;
    if (!isFromGetEmployee) {
      this.claimService.updateEmployeeDetails(true);
    }
    if (this.dataSource.data.length > 0) {
      this.showTable = true;
      if (this.table) {
        this.table.renderRows();
      }
    } else {
      this.showTable = false;
    }
  }

  filterMenu(item: PersonEventModel) {
    this.menus = null;
    this.menus =
      [
        { title: 'View Employee Documents', action: 'viewDocuments', disable: false },
      ];
  }

  public onMenuItemClick(item: PersonEventModel, menu: any): void {
    switch (menu.action) {
      case 'viewDocuments':
        this.viewSelectedDocuments = true;
        this.selectedPersonEvent = item;
        this.isStraigthThroughProcess = item.isStraightThroughProcess;
        if (this.isWizard) {
          this.canCaptureFirstMedicalReport = true;
        }
        if (this.selectedPersonEvent.firstMedicalReport) {
          this.showFirstMedicalReportTable = true;
          this.medicalReportDetails.push(this.selectedPersonEvent);
          this.canCaptureFirstMedicalReport = false;
        }
        break;
    }
  }

  public view() {
    this.viewSelectedDocuments = !this.viewSelectedDocuments;
  }

  public expand() {
    this.isViewMode = !this.isViewMode;
  }

  public sendForCapturing(): void {
    const document = this.claimAccidentDocumentComponent.checkIfDocumentTypeBeenAccepted(DocumentTypeEnum.FirstMedicalReport);
    if (document) {
      this.createDigiCareReport();
    } else {
      this.alertService.loading('Please Accept First Medical Report');
    }
  }

  private createDigiCareReport() {
    this.isLoading$.next(true);
    const workItem = this.createDigiCareWorkItem(EventTypeEnum.Accident ? MedicalFormReportTypeEnum.FirstAccidentMedicalReport : MedicalFormReportTypeEnum.FirstDiseaseMedicalReport);

    this.digiCareService.addWorkItem(workItem).pipe(takeUntil(this.unSubscribe$)).subscribe((workItemId) => {
      this.startWizard(workItemId);
    });
  }

  private startWizard(workItemId: number) {
    this.isLoading$.next(true);
    let startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = this.event.eventType === EventTypeEnum.Accident ? Constants.digiCareMedicalFormAccidentWizard : Constants.digiCareMedicalFormDiseaseWizard;
    startWizardRequest = this.setMedicalFormType(startWizardRequest, workItemId);
    startWizardRequest.linkedItemId = this.event.personEvents[0].personEventId;
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
    specificMedicalReportForm.medicalReportForm.personEventId = this.event.personEvents[0].personEventId;

    startWizard.data = JSON.stringify(specificMedicalReportForm);
    return startWizard;
  }

  private createWizard(startWizardRequest: StartWizardRequest): void {
    this.isLoading$.next(true);
    this.wizardService.startWizard(startWizardRequest).subscribe((result) => {
      this.alertService.success(startWizardRequest.type + ' wizard started successfully');
      this.checkIfWizardExsits();
      this.isLoading$.next(false);
    }, (error) => {
      this.alertService.error(error);
      this.isLoading$.next(false);
    });
  }

  filterMenuFirstMedical(item: PersonEventModel) {
    this.firstMedicalMenus = null;
    this.firstMedicalMenus =
      [
        { title: 'View', action: 'view', disable: false },
        { title: 'Edit', action: 'edit', disable: true },
        { title: 'Remove', action: 'remove', disable: true },
      ];
  }

  public onFirstMedicalMenuItemClick(item: PersonEventModel, menu: any): void {
    switch (menu.action) {
      case 'view':
        this.captureFirstMedicalReport();
        break;
      case 'edit':
        this.captureFirstMedicalReport();
        break;
      case 'remove':
        this.claimAccidentDocumentComponent.removeFirstMedicalReport();
        this.selectedPersonEvent.firstMedicalReport = null;
        this.showFirstMedicalReportTable = false;
        this.medicalReportDetails = [];
        this.canCaptureFirstMedicalReport = true;
        break;
    }
  }

  filterProgressMedicalMenu(item: ProgressMedicalReportForm) {
    this.progressMedicalMenus = null;
    if (item.progressMedicalReportFormId !== 0) {
      this.progressMedicalMenus =
        [
          { title: 'Edit', action: 'edit', disable: false },
          { title: 'Remove', action: 'remove', disable: false },
        ];
    } else {
      this.progressMedicalMenus =
        [
          { title: 'View', action: 'edit', disable: false },
        ];
    }
  }

  public onProgressMedicalMenuItemClick(item: ProgressMedicalReportForm, menu: any): void {
    const medicalReportFormWizardDetail = new MedicalReportFormWizardDetail();
    switch (menu.action) {
      case 'edit':
        this.selectedProgressReport = item;
        this.captureProgressMedicalReport();
        break;
      case 'remove':
        this.isLoadingProgressMedicalReports$.next(true);
        medicalReportFormWizardDetail.medicalReportFormId = item.medicalReportForm.medicalReportFormId;
        medicalReportFormWizardDetail.personEventId = item.medicalReportForm.personEventId;
        medicalReportFormWizardDetail.medicalFormReportType = MedicalFormReportTypeEnum.ProgressAccidentMedicalReport;
        this.accidentService.RemoveMedicalReportForm(medicalReportFormWizardDetail).subscribe(() => {
          this.checkIfProgressMedicalReportExsits();
        });
        break;
    }
  }

  filterMenuFinalMedical(item: PersonEventModel) {
    this.finalMedicalMenus = null;
    this.finalMedicalMenus =
      [
        { title: 'Edit', action: 'edit', disable: true },
        { title: 'View', action: 'view', disable: false },
        { title: 'Remove', action: 'remove', disable: true },
      ];
  }

  public onFinalMedicalMenuItemClick(item: FinalMedicalReportForm, menu: any): void {
    const medicalReportFormWizardDetail = new MedicalReportFormWizardDetail();
    switch (menu.action) {
      case 'edit':
        this.selectedFinalReport = item;
        this.captureFinalMedicalReport();
        break;
      case 'view':
        this.selectedFinalReport = item;
        this.captureFinalMedicalReport();
        break;
      case 'remove':
        this.isLoadingFinalMedicalReports$.next(true);
        medicalReportFormWizardDetail.medicalReportFormId = item.medicalReportForm.medicalReportFormId;
        medicalReportFormWizardDetail.personEventId = item.medicalReportForm.personEventId;
        medicalReportFormWizardDetail.medicalFormReportType = MedicalFormReportTypeEnum.FinalAccidentMedicalReport;
        this.accidentService.RemoveMedicalReportForm(medicalReportFormWizardDetail).subscribe(() => {
          this.checkIfFinalMedicalReportExsits();
        });
        break;
    }
  }

  captureFirstMedicalReport() {
    const document = this.claimAccidentDocumentComponent.checkIfDocumentTypeBeenUploaded(DocumentTypeEnum.FirstMedicalReport);
    if (document) {
      const personEvent = this.selectedPersonEvent;
      const dialogRef = this.dialog.open(FirstMedicalReportComponent, {
        data: { personEvent, eventType: this.event.eventType, firstMedicalReportForm: this.firstMedicalReportForm }
      });
      dialogRef.afterClosed().subscribe(data => {
        if (data) {
          this.selectedPersonEvent.firstMedicalReport = data;
          const index = this.event.personEvents.findIndex(a => a.personEventId === this.selectedPersonEvent.personEventId);
          this.event.personEvents[index] = this.selectedPersonEvent;
          this.showFirstMedicalReportTable = true;
          this.medicalReportDetails.push(this.selectedPersonEvent);
          this.canCaptureFirstMedicalReport = false;
          if (this.isReadOnly) {
            this.isLoading$.next(true);
            this.accidentService.ValidateFirstMedicalReportSTP(this.selectedPersonEvent.firstMedicalReport).pipe(takeUntil(this.unSubscribe$)).subscribe((result) => {
              this.selectedPersonEvent.firstMedicalReport = result;
              this.isLoading$.next(false);
            });
          }
        }
      });
    } else {
      this.alertService.loading('Please Upload First Medical Report');
    }
  }

  captureProgressMedicalReport() {
    const progressMedicalReport = this.selectedProgressReport;
    const dialogRef = this.dialog.open(ProgressMedicalReportComponent, {
      data: { progressMedicalReport, eventType: this.event.eventType, eventDate: this.event.eventDate, personEvent: this.selectedPersonEvent }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.isLoading$.next(true);
        this.accidentService.ValidateProgressMedicalReportSTP(data).pipe(takeUntil(this.unSubscribe$)).subscribe((result) => {
          this.checkIfProgressMedicalReportExsits();
          this.isLoading$.next(false);
        });
      } else {
        if (this.selectedProgressReport !== null) {
          this.selectedProgressReport = null;
        }
      }
    });
  }

  captureFinalMedicalReport() {
    const finalMedicalReport = this.selectedFinalReport;
    const dialogRef = this.dialog.open(FinalMedicalReportComponent, {
      data: { finalMedicalReport, eventType: this.event.eventType, eventDate: this.event.eventDate, personEvent: this.selectedPersonEvent }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.isLoading$.next(true);
        this.accidentService.ValidateFinalMedicalReportSTP(data).pipe(takeUntil(this.unSubscribe$)).subscribe((result) => {
          this.checkIfFinalMedicalReportExsits();
          this.isLoading$.next(false);
        });
      } else {
        if (this.selectedFinalReport !== null) {
          this.selectedFinalReport = null;
        }
      }
    });
  }

  private createDigiCareWorkItem(medicalFormReportType: MedicalFormReportTypeEnum): WorkItem {
    const workItem = new WorkItem();
    const workItemType = new WorkItemType();
    const date = this.datepipe.transform(new Date(), Constants.dateString);

    switch (medicalFormReportType) {
      case MedicalFormReportTypeEnum.FirstAccidentMedicalReport:
        workItemType.wizardConfigurationId = Constants.digiCareFirstMedicalWizardConfigurationIdAccident;
        workItemType.workItemTypeDescription = Constants.digiCareFirstMedicalReportAccident;
        workItemType.workItemTypeId = Constants.digiCareFirstMedicalItemTypeAccident;
        workItemType.workItemTypeName = Constants.digiCareFirstMedicalReportAccident;
        workItem.workItemName = `${Constants.digiCareFirstMedicalReportAccident} ${date} - ${this.event.personEvents[0].personEventId}`;
        break;
      case MedicalFormReportTypeEnum.ProgressAccidentMedicalReport:
        workItemType.wizardConfigurationId = Constants.digiCareProgressMedicalWizardConfigurationIdAccident;
        workItemType.workItemTypeDescription = Constants.digiCareProgressMedicalReportAccident;
        workItemType.workItemTypeId = Constants.digiCareProgressMedicalItemTypeAccident;
        workItemType.workItemTypeName = Constants.digiCareProgressMedicalReportAccident;
        workItem.workItemName = `${Constants.digiCareProgressMedicalReportAccident} ${date} - ${this.event.personEvents[0].personEventId}`;
        break;
      case MedicalFormReportTypeEnum.FinalAccidentMedicalReport:
        workItemType.wizardConfigurationId = Constants.digiCareFinalMedicalWizardConfigurationIdAccident;
        workItemType.workItemTypeDescription = Constants.digiCareFinalMedicalReportAccident;
        workItemType.workItemTypeId = Constants.digiCareFinalMedicalItemTypeAccident;
        workItemType.workItemTypeName = Constants.digiCareFinalMedicalReportAccident;
        workItem.workItemName = `${Constants.digiCareFinalMedicalReportAccident} ${date} - ${this.event.personEvents[0].personEventId}`;
        break;
      case MedicalFormReportTypeEnum.FirstDiseaseMedicalReport:
        workItemType.wizardConfigurationId = Constants.digiCareFirstMedicalWizardConfigurationIdDisease;
        workItemType.workItemTypeDescription = Constants.digiCareFirstMedicalReportDisease;
        workItemType.workItemTypeId = Constants.digiCareFirstMedicalItemTypeDisease;
        workItemType.workItemTypeName = Constants.digiCareFirstMedicalReportDisease;
        workItem.workItemName = `${Constants.digiCareFirstMedicalReportDisease} ${date} - ${this.event.personEvents[0].personEventId}`;
        break;
      case MedicalFormReportTypeEnum.ProgressDiseaseMedicalReport:
        workItemType.wizardConfigurationId = Constants.digiCareProgressMedicalWizardConfigurationIdDisease;
        workItemType.workItemTypeDescription = Constants.digiCareProgressMedicalReportDisease;
        workItemType.workItemTypeId = Constants.digiCareProgressMedicalItemTypeDisease;
        workItemType.workItemTypeName = Constants.digiCareProgressMedicalReportDisease;
        workItem.workItemName = `${Constants.digiCareProgressMedicalReportDisease} ${date} - ${this.event.personEvents[0].personEventId}`;
        break;
      case MedicalFormReportTypeEnum.FinalAccidentMedicalReport:
        workItemType.wizardConfigurationId = Constants.digiCareFinalMedicalWizardConfigurationIdDisease;
        workItemType.workItemTypeDescription = Constants.digiCareFinalMedicalReportDisease;
        workItemType.workItemTypeId = Constants.digiCareFinalMedicalItemTypeDisease;
        workItemType.workItemTypeName = Constants.digiCareFinalMedicalReportDisease;
        workItem.workItemName = `${Constants.digiCareFinalMedicalReportDisease} ${date} - ${this.event.personEvents[0].personEventId}`;
        break;
    }
    workItem.workItemType = workItemType;
    workItem.workItemState = WorkItemStateEnum.InProgress;
    workItem.tenantId = this.tenant.id;
    return workItem;
  }

  public checkReportInDigiCare(data: any) {
    if (data.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.ProgressAccidentMedicalReport) {
      this.checkIfProgressMedicalReportExsits();
    }
    if (data.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.FirstAccidentMedicalReport) {
      this.checkIfFirstMedicalReportExsits();
    }
    if (data.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.FinalAccidentMedicalReport) {
      this.checkIfFinalMedicalReportExsits();
      this.onRefreshParentRequired.emit(true);
    }
  }

  getDisplayedColumns(): any[] {

    let columnDefinitions = [
      { def: 'name', show: true },
      { def: 'surname', show: true },
      { def: 'idPassportNumber', show: true },
      { def: 'isVopdVerified', show: (this.event.personEvents[0].claims !== undefined && this.event.personEvents[0].claims.length > 0) },
      { def: 'actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }
}
