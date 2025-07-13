import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FirstMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-medical-report-form';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { BehaviorSubject } from 'rxjs';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { AccidentService } from 'projects/claimcare/src/app/claim-manager/Services/accident.service';
import { EventModel } from '../../../../entities/personEvent/event.model';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { EventTypeEnum } from '../../../../enums/event-type-enum';
import { MedicalUploadDialogComponent } from '../../../medical-upload-icon/medical-upload-dialog/medical-upload-dialog.component';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';
import { MedicalReportTypeEnum } from '../../../medical-upload-icon/medical-report-type.enum';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Icd10CodeEstimateAmount } from 'projects/shared-models-lib/src/lib/common/icd10-code-estimate-amount';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { ICD10EstimateFilter } from 'projects/shared-models-lib/src/lib/common/icd10-estimate-filter';
import { ClaimRequirementService } from 'projects/claimcare/src/app/claim-manager/Services/claim-requirement.service';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';

@Component({
  selector: 'holistic-sicknote-medical-reports',
  templateUrl: './holistic-sicknote-medical-reports.component.html',
  styleUrls: ['./holistic-sicknote-medical-reports.component.css']
})
export class HolisticSickNoteMedicalReportsComponent extends UnSubscribe implements OnChanges {

  @Input() event: EventModel; //required
  @Input() personEvent: PersonEventModel; //required
  @Input() isReadOnly = false; //optional
  @Input() isWizard: boolean; //optional
  @Input() triggerRefresh: boolean;
  @Input() triggerSelectedTab = 0;

  @Output() refreshClaimEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() isDisabled: EventEmitter<boolean> = new EventEmitter();
  @Output() canCaptureFirstMedicalReport: EventEmitter<boolean> = new EventEmitter();
  @Output() documentTypeAccepted: EventEmitter<boolean> = new EventEmitter();
  @Output() eventType: EventEmitter<EventTypeEnum> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  menus: { title: string, action: string, disable: boolean }[];
  documentStatusMenus: { title: string, disable: boolean }[];

  sickNoteReportEnum = MedicalReportTypeEnum.SickNoteReport;
  icd10CodesEstimatesAmounts: Icd10CodeEstimateAmount[] = [];
  public icd10CodeFilters: ICD10EstimateFilter[] = [];

  dataSource = new MatTableDataSource<FirstMedicalReportForm>();
  medicalReportDetails: FirstMedicalReportForm[] = [];

  @ViewChild(MatPaginator, { static: false }) set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  constructor(
    private readonly accidentService: AccidentService,
    public dialog: MatDialog,
    private readonly alertService: AlertService,
    private readonly claimRequirementService: ClaimRequirementService,
  ) { super() }

  ngOnChanges(_changes: SimpleChanges): void {
    if ((this.triggerRefresh && this.triggerSelectedTab === 4)) {
      this.settingData();
    }
  }

  settingData() {
    this.isLoading$.next(true);
    this.medicalReportDetails = [];

    if (!this.isWizard) {
      this.getSickNoteMedicalReportForm();
    } else if (this.personEvent.firstMedicalReport) {
      this.updateMedicalReportDetails();
    } else {
      this.medicalReportDetails = [];
      this.isLoading$.next(false);
    }
  }

  handleClaimRequirementIfExists() {
    if (this.personEvent?.personEventClaimRequirements?.length > 0 && this.personEvent?.personEventClaimRequirements?.some(s => s.claimRequirementCategory?.description == 'First Medical Report Outstanding')) {
      const index = this.personEvent.personEventClaimRequirements.findIndex(s => s.claimRequirementCategory.description == 'First Medical Report Outstanding');
      if (index > -1) {

        let updatedRequired = false;
        if (this.personEvent.firstMedicalReport && !this.personEvent.personEventClaimRequirements[index].dateClosed) {
          this.personEvent.personEventClaimRequirements[index].dateClosed = new Date().getCorrectUCTDate();
          updatedRequired = true;
        } else if (!this.personEvent.firstMedicalReport && this.personEvent.personEventClaimRequirements[index].dateClosed) {
          this.personEvent.personEventClaimRequirements[index].dateClosed = null;
          updatedRequired = true;
        }

        if (this.personEvent.personEventStatus != PersonEventStatusEnum.New && updatedRequired) {
          this.claimRequirementService.updatePersonEventClaimRequirement(this.personEvent.personEventClaimRequirements[index]).subscribe(_ => {
            this.alertService.success('sick note report requirement updated successfully...');
          });
        }
      }
    }
  }

  getSickNoteMedicalReportForm() {
    this.accidentService.getFirstMedicalReportFormByReportType(this.personEvent.personEventId, +MedicalFormReportTypeEnum.SickNoteMedicalReport).subscribe(result => {
      if (result) {
        this.medicalReportDetails = [];
        this.personEvent.firstMedicalReport = result;
        this.canCaptureFirstMedicalReport.emit(result ? false : true);
        this.medicalReportDetails.push(this.personEvent.firstMedicalReport);
        this.setDataSource();
      }
      this.isLoading$.next(false);
    });
  }

  updateMedicalReportDetails() {
    if (this.medicalReportDetails.length > 0) {
      this.medicalReportDetails = [];
      this.medicalReportDetails.push(this.personEvent.firstMedicalReport);
      this.setDataSource();
    } else {
      this.medicalReportDetails.push(this.personEvent.firstMedicalReport);
      this.setDataSource();
    }
    this.isLoading$.next(false);
  }

  setDataSource() {
    this.dataSource = new MatTableDataSource<FirstMedicalReportForm>(this.medicalReportDetails);
    this.dataSource.paginator = this.paginator;

    this.handleClaimRequirementIfExists();
  }

  filterMenuFirstMedical(item: PersonEventModel) {
    this.menus = null;
    this.menus =
      [
        { title: 'View', action: 'view', disable: false },
        { title: 'Edit', action: 'edit', disable: true },
        { title: 'Remove', action: 'remove', disable: true },
      ];
  }

  openConfirmationDialog(item: FirstMedicalReportForm) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Remove first medical report?',
        text: `Are you sure you want to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading$.next(true);
        this.loadingMessage$.next('removing...please wait');
        item.medicalReportForm.isDeleted = true;
        this.accidentService.UpdateFirstMedicalReportForm(item).subscribe(_removed => {
          if (_removed) {
            this.medicalReportDetails = [];
            this.personEvent.firstMedicalReport = null;
            this.settingData();
            this.alertService.loading('first medical report removed');
            this.handleClaimRequirementIfExists();
            this.isLoading$.next(false);
          }
        });
      }
    });
  }

  captureFirstMedicalReport(isReadOnly: boolean) {
    const dialogRef = this.dialog.open(MedicalUploadDialogComponent, {
      width: '1300px',
      maxHeight: '700px',
      disableClose: true,
      data: {
        selectedPersonEvent: this.personEvent,
        event: this.event,
        isWizard: this.isWizard,
        isReadOnly: isReadOnly,
        medicalReportType: MedicalReportTypeEnum.SickNoteReport
      }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.personEvent.firstMedicalReport = data;
        this.medicalReportDetails[0] = data;
        this.setDataSource();
        this.canCaptureFirstMedicalReport.emit(false);
        this.refreshClaimEmit.emit(true);
      }
    });
  }

  onFirstMedicalMenuItemClick(item: FirstMedicalReportForm, menu: string): void {
    switch (menu) {
      case 'view':
        this.captureFirstMedicalReport(true);
        break;
      case 'edit':
        this.captureFirstMedicalReport(false);
        break;
      case 'remove':
        this.openConfirmationDialog(item);
        break;
    }
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'healthCareProvider', show: true },
      { def: 'practiceNumber', show: true },
      { def: 'firstDayOff', show: true },
      { def: 'lastDayOff', show: true },
      { def: 'estimatedDaysOff', show: true },
      { def: 'actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
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

  setStatusClass(item: FirstMedicalReportForm): string {
    if (!item.medicalReportForm.documentStatusId) { return 'mat-label other-label'; }
    switch (item.medicalReportForm.documentStatusId) {
      case DocumentStatusEnum.Received:
        return 'green';
      case DocumentStatusEnum.Awaiting:
        return 'amber';
      case DocumentStatusEnum.Accepted:
        return 'blue';
      case DocumentStatusEnum.Rejected:
        return 'red';
      case DocumentStatusEnum.Waived:
        return 'purple';
    }
    return 'green';
  }

  filterDocumentStatusMenu(item: FirstMedicalReportForm) {
    const currentDocumentStatus = item.medicalReportForm.documentStatusId;

    this.documentStatusMenus = null;
    this.documentStatusMenus =
      [
        { title: 'Accept', disable: (this.personEvent.isStraightThroughProcess 
                                    || currentDocumentStatus === DocumentStatusEnum.Received) },
        { title: 'Reject', disable: (this.personEvent.isStraightThroughProcess 
                                    || currentDocumentStatus === DocumentStatusEnum.Rejected) },
        { title: 'Waive', disable: (this.personEvent.isStraightThroughProcess 
                                    || currentDocumentStatus === DocumentStatusEnum.Waived) },
      ].filter(menu => !menu.disable);
  }

  setDocumentStatus(item: FirstMedicalReportForm): string {
    if (!item.medicalReportForm.documentStatusId) { return 'Document not loaded'; }
    else {
      return DocumentStatusEnum[item.medicalReportForm.documentStatusId];
    }
  }

  onDocumentStatusMenuItemClick(menu: any, item: FirstMedicalReportForm): void {
    switch (menu.title) {
      case 'Accept':
        this.processMedicalReportDocumentStatus(true, item, DocumentStatusEnum.Received);
        break;
      case 'Delete':
        this.openConfirmationDialog(item);
        break;
      case 'Reject':
        this.processMedicalReportDocumentStatus(true, item, DocumentStatusEnum.Rejected);
        break;
      case 'Awaiting':
        this.processMedicalReportDocumentStatus(true, item, DocumentStatusEnum.Awaiting);
        break;
    }
  }

  processMedicalReportDocumentStatus(isUpdate: boolean, firstMedicalReport: FirstMedicalReportForm, documentStatus: DocumentStatusEnum) {
    firstMedicalReport.medicalReportForm.documentStatusId = documentStatus;
    this.isLoading$.next(true);
    this.accidentService.UpdateFirstMedicalReportForm(firstMedicalReport).subscribe((result) => {
      if (result) {
        this.settingData();
      }
    });
  }
}
