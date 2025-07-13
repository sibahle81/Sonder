import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';
import { Constants } from 'projects/claimcare/src/app/constants';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { AccidentService } from 'projects/claimcare/src/app/claim-manager/Services/accident.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { EventModel } from '../../../../entities/personEvent/event.model';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { EventTypeEnum } from '../../../../enums/event-type-enum';
import { MedicalReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-report-enum';
import { MatTableDataSource } from '@angular/material/table';
import { FloatMessage } from '../../../message-float/message-float-model/float-message';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { ErrorTypeEnum } from '../../../message-float/message-float-model/error-type-enum';
import { MedicalUploadDialogComponent } from '../../../medical-upload-icon/medical-upload-dialog/medical-upload-dialog.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';

@Component({
  selector: 'holistic-progress-medical-reports',
  templateUrl: './holistic-progress-medical-reports.component.html',
  styleUrls: ['./holistic-progress-medical-reports.component.css']
})
export class HolisticProgressMedicalReportsComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() isWizard: boolean;

  @Input() event: EventModel;
  @Output() refreshClaimEmit: EventEmitter<boolean> = new EventEmitter();

  @Output() isDisabled: EventEmitter<boolean> = new EventEmitter();
  @Output() eventType: EventEmitter<EventTypeEnum> = new EventEmitter();
  @Output() documentTypeAccepted: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isRemovingReport$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  medicalReportDetails = [];
  menus: { title: string, action: string, disable: boolean }[];
  documentStatusMenus: { title: string, disable: boolean }[];
  hasPermission: boolean;
  requiredPermission = '';
  tenant: Tenant;
  documentsAccepted: boolean;
  isStraightThrough: boolean;
  floatMessage: FloatMessage;
  currentDocument: Document | GenericDocument;
  progressMedicalReportEnum = MedicalReportTypeEnum.ProgressReport;
  UserReminders: UserReminder[] = [];
  tempKeyvalue: string;

  selectedProgressReport: ProgressMedicalReportForm;
  disableForm = false;

  dataSource = new MatTableDataSource<ProgressMedicalReportForm>();

  @ViewChild(MatPaginator, { static: false }) set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  constructor(
    private readonly accidentService: AccidentService,
    public dialog: MatDialog,
    private readonly wizardService: WizardService,
    private readonly authorizationService: AuthService,
    private readonly userService: UserService,
    private readonly eventService: ClaimCareService,
    private readonly confirmService: ConfirmationDialogsService,
    private readonly documentManagementService: DocumentManagementService,
    private readonly alertService: AlertService,
  ) { super() }

  ngOnChanges(changes: SimpleChanges): void {
    this.settingData();
  }

  settingData() {
    if (!this.isWizard) {
      this.getCurrentTenant();
      this.getEvent();
      this.getDocument();
      this.updateMedicalReportDetails();
      this.isLoading$.next(true);
    } else {
      this.personEvent.progressMedicalReportForms ? this.medicalReportDetails.push(this.personEvent.progressMedicalReportForms) : this.medicalReportDetails = [];
      this.isLoading$.next(true);
    }
  }
  

  setDataSource() {
    this.dataSource = new MatTableDataSource<ProgressMedicalReportForm>(this.medicalReportDetails);
    this.dataSource.paginator = this.paginator;
  }

  getEvent() {
    this.eventService.getEventDetails(this.personEvent.eventId).subscribe(result => {
      this.event = result;
      this.isStraightThrough = this.event.personEvents[0].isStraightThroughProcess;
      this.eventType.emit(this.event.eventType)
      this.checkIfWizardExists();
      this.getProgressMedicalReportForm();
    })
  }

  updateMedicalReportDetails() {
    if (this.medicalReportDetails.length > 0) {
      this.medicalReportDetails = [];
      this.setReports();
    } else {
      this.setReports();
    }
  }

  setReports() {
    this.personEvent.progressMedicalReportForms?.forEach(form => {
      this.medicalReportDetails.push(form);
    })

    this.setDataSource();
  }

  getProgressMedicalReportForm() {
    this.isLoading$.next(true);
    let sub = this.accidentService.GetProgressMedicalReportForms(this.personEvent.personEventId).subscribe((progressMedicalReports) => {
      if (progressMedicalReports.length > 0) {
        this.personEvent.progressMedicalReportForms = progressMedicalReports;
        this.medicalReportDetails = [];
        this.medicalReportDetails = progressMedicalReports;
        this.createKeyValueList();
        this.setDataSource();
        this.isLoading$.next(false);
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  filterMenuProgressMedical(_item: PersonEventModel) {
    this.menus = null;
    this.menus =
      [
        { title: 'View', action: 'view', disable: false },
        { title: 'Edit', action: 'edit', disable: true },
        { title: 'Remove', action: 'remove', disable: true },
      ];
  }

  filterDocumentStatusMenu(_item: ProgressMedicalReportForm) {
    const currentDocumentStatus = _item.medicalReportForm.documentStatusId;
    
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

  openConfirmationDialog(item: ProgressMedicalReportForm) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Remove progress medical report?',
        text: `Are you sure you want to remove progress medical report?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isRemovingReport$.next(true);
        item.medicalReportForm.isDeleted = true;
        this.accidentService.UpdateProgressMedicalReportForm(item).subscribe(_removed => {
          if (_removed) {
            this.medicalReportDetails = [];
            const indexToRemove = this.personEvent.progressMedicalReportForms.findIndex(i => i === item);
            this.personEvent.progressMedicalReportForms.splice(indexToRemove, 1);
            this.settingData();           
            this.alertService.loading('progress medical report removed');
            this.isLoading$.next(false);
            this.isRemovingReport$.next(false);
          }
        });
      } else {
      }
    });
  }

  processMedicalReportDocumentStatus(isUpdate: boolean, progressMedicalReport: ProgressMedicalReportForm, documentStatus: DocumentStatusEnum) {
    let item = new GenericDocument();
    item.id = progressMedicalReport.medicalReportForm.documentId;
    item.documentSet = DocumentSetEnum.ClaimMedicalDocuments;
    item.documentType = DocumentTypeEnum.ProgressMedicalReport;
    item.documentStatus = documentStatus;
    progressMedicalReport.medicalReportForm.documentStatusId = documentStatus;
    item.isDeleted = isUpdate ? false : true;
    this.isLoading$.next(true);
    this.accidentService.UpdateProgressMedicalReportForm(progressMedicalReport).subscribe((result) => {
      if (result) {
        this.documentManagementService.updateDocumentGeneric(item).subscribe((_result) => {
          this.settingData();
          this.isLoading$.next(true);
        });
      }
    });
  }

  checkIfWizardExsits() {
    this.wizardService.getWizardsByTypeAndLinkedItemId(this.personEvent.personEventId,
      this.event.eventType === EventTypeEnum.Accident ? Constants.digiCareMedicalFormAccidentWizard : Constants.digiCareMedicalFormDiseaseWizard).subscribe((result) => {
        this.disableForm = result ? true : false;
      });
  }
  getDocument() {
    if (this.isWizard && this.personEvent.progressMedicalReportForms && this.personEvent.progressMedicalReportForms[0].medicalReportForm.documentId > 0) {
      this.documentManagementService.GetDocumentById(this.personEvent.progressMedicalReportForms[0].medicalReportForm.documentId).subscribe(result => {
        if (result) {
          this.currentDocument = result;
          this.documentsAccepted = this.checkIfDocumentTypeBeenAccepted(DocumentTypeEnum.ProgressMedicalReport, result)
          this.documentTypeAccepted.emit(this.documentsAccepted);
        } else {
          this.setMessage('Please Upload progress Medical Report', ErrorTypeEnum.warning);
        };
      });
    }
  }

  setMessage(message: string, errorType: ErrorTypeEnum) {
    this.floatMessage = new FloatMessage();
    this.floatMessage.message = message;
    this.floatMessage.errorType = errorType;
  }

  getDocumentStatus(entity: ProgressMedicalReportForm): boolean {
    var keyValue = this.personEvent.personEventId.toString() + "_" + entity.progressMedicalReportFormId;
    this.documentManagementService.getDocumentsByKey('ProgressMedicalReportId', keyValue).subscribe(result => {
      if (result.length > 0) {
        this.currentDocument = result[0];
        this.documentsAccepted = this.checkIfDocumentTypeBeenAccepted(DocumentTypeEnum.ProgressMedicalReport, this.currentDocument)
        this.documentTypeAccepted.emit(this.documentsAccepted);
        if (!this.currentDocument.documentStatus) { return 'no status' };

        this.isLoading$.next(true);
        return true;
      }

    });
    return false;
  }


  formatText(text: string): string {
    return text ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : '<value missing from enum>';
  }

  setStatusClass(_item: ProgressMedicalReportForm): string {
    if (!_item.medicalReportForm.documentStatusId) { return 'mat-label other-label'; }
    switch (_item.medicalReportForm.documentStatusId) {
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

  setDocumentStatus(_item: ProgressMedicalReportForm): string {
    if (!_item.medicalReportForm.documentStatusId) { return 'Document not loaded'; }
    else {
      return DocumentStatusEnum[_item.medicalReportForm.documentStatusId];
    }
  }

  captureProgressMedicalReport(item: ProgressMedicalReportForm, isReadOnly: boolean) {
    const dialogRef = this.dialog.open(MedicalUploadDialogComponent, {
      width: '1300px',
      maxHeight: '700px',
      disableClose: true,
      data: {
        selectedMedicalReport: item,
        selectedPersonEvent: this.personEvent,
        event: this.event,
        isWizard: this.isWizard,
        isReadOnly: isReadOnly,
        medicalReportType: MedicalReportTypeEnum.ProgressReport
      }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.setDataSource();
        if (!this.isWizard) {
          this.isLoading$.next(true);
          this.getProgressMedicalReportForm();
          this.isLoading$.next(false);
        }
      }
    });
  }

  createKeyValueList(): any[] {
    const keyValueList: any[] = [];
    const key = 'ProgressMedicalReportId';
    for (const report of this.medicalReportDetails) {
      const value = `${this.personEvent.personEventId.toString()}_${report.progressMedicalReportFormId}`;
      this.tempKeyvalue = value;
      const keyValueDict = {
        [key]: value
      };
      keyValueList.push(keyValueDict);
    }
    return keyValueList;
  }

  checkIfDocumentTypeBeenAccepted(documentType: DocumentTypeEnum, document: Document | GenericDocument): boolean {
    if (document && document.createdDate) {
      if (document && 'docTypeId' in document) {
        return document.createdDate !== null
          && document.documentStatus === DocumentStatusEnum.Accepted
          && document.docTypeId === documentType
      } else {
        return document.createdDate !== null
          && document.documentStatus === DocumentStatusEnum.Accepted
      }
    }

  }

  checkIfWizardExists() {
    this.wizardService.getWizardsByTypeAndLinkedItemId(this.personEvent.personEventId,
      this.event.eventType === EventTypeEnum.Accident ? Constants.digiCareMedicalFormAccidentWizard : Constants.digiCareMedicalFormDiseaseWizard).subscribe((result) => {
        this.isDisabled.emit(result ? true : false);
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

  onProgressMedicalMenuItemClick(item: ProgressMedicalReportForm, menu: string): void {
    switch (menu) {
      case 'view':
        this.captureProgressMedicalReport(item, true);
        break;
      case 'edit':
        this.captureProgressMedicalReport(item, false);
        break;
      case 'remove':
        this.openConfirmationDialog(item);
        break;
    }
  }

  onDocumentStatusMenuItemClick(menu: any, _item: ProgressMedicalReportForm): void {
    switch (menu.title) {
      case 'Accept':
        this.processMedicalReportDocumentStatus(true, _item, DocumentStatusEnum.Received);
        break;
      case 'Delete':
        this.openConfirmationDialog(_item);
        break;
      case 'Reject':
        this.processMedicalReportDocumentStatus(true, _item, DocumentStatusEnum.Rejected);
        break;
      case 'Awaiting':
        this.processMedicalReportDocumentStatus(true, _item, DocumentStatusEnum.Awaiting);
        break;
    }
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'healthCareProvider', show: true },
      { def: 'practiceNumber', show: true },
      { def: 'iCD10Code', show: true },
      { def: 'documentStatus', show: true },
      { def: 'actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }
}
