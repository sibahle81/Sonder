import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { AccidentService } from 'projects/claimcare/src/app/claim-manager/Services/accident.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { Constants } from 'projects/claimcare/src/app/constants';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';
import { EventModel } from '../../../../entities/personEvent/event.model';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { EventTypeEnum } from '../../../../enums/event-type-enum';
import { FloatMessage } from '../../../message-float/message-float-model/float-message';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { MatTableDataSource } from '@angular/material/table';
import { MedicalReportTypeEnum } from '../../../medical-upload-icon/medical-report-type.enum';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { ErrorTypeEnum } from '../../../message-float/message-float-model/error-type-enum';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { MedicalUploadDialogComponent } from '../../../medical-upload-icon/medical-upload-dialog/medical-upload-dialog.component';
import { TemplateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/template-type-enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ClaimNote } from '../../../../entities/claim-note';
import { DeleteFinalMedicalReportComponent } from '../delete-final-medical-report/delete-final-medical-report.component';

@Component({
  selector: 'holistic-final-medical-reports',
  templateUrl: './holistic-final-medical-reports.component.html',
  styleUrls: ['./holistic-final-medical-reports.component.css']
})
export class HolisticFinalMedicalReportsComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() isWizard: boolean;

  @Input() event: EventModel;

  @Output() isDisabled: EventEmitter<boolean> = new EventEmitter();
  @Output() canCaptureFirstMedicalReport: EventEmitter<boolean> = new EventEmitter();
  @Output() eventType: EventEmitter<EventTypeEnum> = new EventEmitter();
  @Output() documentTypeAccepted: EventEmitter<boolean> = new EventEmitter();
  @Output() refreshClaimEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isRemovingReport$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  medicalReportDetails: FinalMedicalReportForm[] = [];
  menus: { title: string, action: string, disable: boolean }[];
  documentStatusMenus: { title: string, disable: boolean }[];
  hasPermission: boolean;
  requiredPermission = '';
  tenant: Tenant;
  documentsAccepted: boolean;
  isStraightThrough: boolean;
  floatMessage: FloatMessage;
  currentDocument: Document | GenericDocument;
  finalMedicalReportEnum = MedicalReportTypeEnum.FinalMedicalReport;
  UserReminders: UserReminder[] = [];
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('getting claim requirements...please wait');

  selectedFinalReport: FinalMedicalReportForm;
  disableForm = false;
  medicalReportForm: FinalMedicalReportForm[] = [];
  
  dataSource = new MatTableDataSource<FinalMedicalReportForm>();

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
    private readonly claimService: ClaimCareService,
    private readonly alertService: AlertService,
  ) { super() }

  ngOnChanges(changes: SimpleChanges): void {
    this.settingData();
  }

  settingData() {
    this.getFinalMedicalReportForm();
    
    if (!this.isWizard) {
      this.getCurrentTenant();
      this.getEvent();
    } else if (this.personEvent.finalMedicalReport) {
      this.getDocument();
      this.updateMedicalReportDetails();
      this.isLoading$.next(false);
    } else {
      this.personEvent.finalMedicalReport ? this.medicalReportDetails.push(this.personEvent.finalMedicalReport) : this.medicalReportDetails = [];
      this.isLoading$.next(false);
    }
  }

  setDataSource() {
    this.dataSource = new MatTableDataSource<FinalMedicalReportForm>(this.medicalReportDetails);
    this.dataSource.paginator = this.paginator;
  }

  getEvent() {
    this.isLoading$.next(true);
    this.eventService.getEventDetails(this.personEvent.eventId).subscribe(result => {
      if (result) {
        this.event = result;
        this.checkIfWizardExsits();
      } 
      this.isLoading$.next(false);
    });
  }

  updateMedicalReportDetails() {
    if (this.medicalReportDetails.length > 0) {
      this.medicalReportDetails = [];
      this.medicalReportDetails.push(this.personEvent.finalMedicalReport);
      this.setDataSource();
    } else {
      this.medicalReportDetails.push(this.personEvent.finalMedicalReport);
      this.setDataSource();
    }
    this.isLoading$.next(false);
  }

  getFinalMedicalReportForm() {
    this.isLoading$.next(true);
    this.accidentService.GetFinalMedicalReportForms(this.personEvent.personEventId).subscribe((finalMedicalReports) => {
      if (finalMedicalReports) {
        this.personEvent.finalMedicalReport = finalMedicalReports[0];
        this.medicalReportDetails = [];
        this.medicalReportDetails = finalMedicalReports;
        this.setDataSource();
        this.refreshClaimEmit.next(true);
      } 
      this.isLoading$.next(false);
    });
  }

  filterMenuFinalMedical(_item: PersonEventModel) {
    this.menus = null;
    this.menus =
      [
        { title: 'View', action: 'view', disable: false },
        { title: 'Edit', action: 'edit', disable: true },
        { title: 'Remove', action: 'remove', disable: true },
      ];
  }

  filterDocumentStatusMenu(_item: FinalMedicalReportForm) {
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

  openConfirmationDialog(item: FinalMedicalReportForm) {
    const dialogRef = this.dialog.open(DeleteFinalMedicalReportComponent, {
      width: '40%',
      disableClose: true,
      data: {
        dialogType: DocumentStatusEnum.Deleted,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isRemovingReport$.next(true);
        item.medicalReportForm.isDeleted = true;
        item.medicalReportForm.reportStatus = "Report Deleted";
        item.medicalReportForm.reportStatusDetail = "Report Deleted: " + result.value;
        this.accidentService.UpdateFinalMedicalReportForm(item).subscribe(_removed => {
          if (_removed) {
            this.settingData();
            this.alertService.loading('final medical report removed');
            this.isLoading$.next(false);
            this.isRemovingReport$.next(false);
          }
        });
      }
    });
  }

  openConfirmationDialogReject(item: FinalMedicalReportForm) {
    const dialogRef = this.dialog.open(DeleteFinalMedicalReportComponent, {
      width: '40%',
      disableClose: true,
      data: {
        dialogType: DocumentStatusEnum.Rejected
      }
    });      
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isRemovingReport$.next(true);
        var obj = this.processFinalMedicalReport(item, true, DocumentStatusEnum.Rejected, result.value);
        this.isRemovingReport$.next(false);
      }
    });
  }

  adjudicateFinalMedicalReport(item: FinalMedicalReportForm) {
    this.confirmService.confirmWithoutContainer('Adjudicate final medical report', 'is the Final Medical Report Conclusive?'
      , 'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
          if (result === false) {
            this.loadingMessages$.next('Requesting documents from Halthcare Practitioner.....');
            this.processFinalMedicalReport(item, false, DocumentStatusEnum.Awaiting);
            this.requestDocumentsfromHCP(this.personEvent.claims[0].claimId, this.personEvent.finalMedicalReport.medicalReportForm.healthcareProviderId, TemplateTypeEnum.RequestDocumentsfromHCP);
          }
          else {
            this.processFinalMedicalReport(item, false, DocumentStatusEnum.Accepted);
          }

        });
  }

  processFinalMedicalReport(finalMedicalReport: FinalMedicalReportForm, isUpdate: boolean, documentStatus: DocumentStatusEnum, reportReason: string = "") {
    let item = new GenericDocument();
    item.id = this.personEvent.finalMedicalReport.medicalReportForm.documentId;
    item.documentSet = DocumentSetEnum.ClaimMedicalDocuments;
    item.documentType = DocumentTypeEnum.FinalMedicalReport;
    item.documentStatus = documentStatus;
    item.isDeleted = isUpdate ? false : true;
    finalMedicalReport.medicalReportForm.documentStatusId = documentStatus;
    if (documentStatus == DocumentStatusEnum.Rejected) {
      finalMedicalReport.medicalReportForm.reportStatus = "Report Rejected";
      finalMedicalReport.medicalReportForm.reportStatusDetail = "Report Rejected: " + reportReason;
    }
    this.isLoading$.next(true);
    this.accidentService.UpdateFinalMedicalReportForm(finalMedicalReport).subscribe((result) => {
      if (result) {
        this.settingData();
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
      this.documentManagementService.GetDocumentById(this.personEvent.firstMedicalReport.medicalReportForm.documentId).subscribe(result => {
        if (result) {
          this.currentDocument = result;
          this.documentsAccepted = this.checkIfDocumentTypeBeenAccepted(DocumentTypeEnum.FirstMedicalReport, result)
          this.documentTypeAccepted.emit(this.documentsAccepted);
        } else {
          this.setMessage('Please Upload Final Medical Report', ErrorTypeEnum.warning);
        };
      });
    } 
    else {
      this.documentManagementService.getDocumentsByKey('FinalMedicalReportId', this.personEvent.personEventId.toString()).subscribe(result => {
        if (result) {
          this.currentDocument = result[0];
          this.documentsAccepted = this.checkIfDocumentTypeBeenAccepted(DocumentTypeEnum.FinalMedicalReport, this.currentDocument)
          this.documentTypeAccepted.emit(this.documentsAccepted);
        }
      });
    }
  }

  setMessage(message: string, errorType: ErrorTypeEnum) {
    this.floatMessage = new FloatMessage();
    this.floatMessage.message = message;
    this.floatMessage.errorType = errorType;
  }

  getDocumentStatus() {
    if (!this.personEvent.finalMedicalReport.medicalReportForm.documentStatusId) { return 'no status' };
    return this.formatText(DocumentStatusEnum[this.personEvent.finalMedicalReport.medicalReportForm.documentStatusId]);
  }

  formatText(text: string): string {
    return text ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : '<value missing from enum>';
  }

  setStatusClass(): string {
    if (!this.personEvent.finalMedicalReport.medicalReportForm.documentStatusId) { return 'mat-label other-label'; }
    switch (this.personEvent.finalMedicalReport.medicalReportForm.documentStatusId) {
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
  }

  captureFinalMedicalReport(item: FinalMedicalReportForm, isReadOnly: boolean) {
    const dialogRef = this.dialog.open(MedicalUploadDialogComponent, {
      width: '1300px',
      maxHeight: '700px',
      disableClose: true,
      data: {
        selectedFinalMedicalReport: item,
        selectedPersonEvent: this.personEvent,
        event: this.event,
        isWizard: this.isWizard,
        isReadOnly: isReadOnly,
        medicalReportType: MedicalReportTypeEnum.FinalMedicalReport
      }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.setDataSource();
        if (!this.isWizard) {
          this.isLoading$.next(true);
          this.getFinalMedicalReportForm();
          this.isLoading$.next(false);
        }
      }
    });
  }

  checkIfDocumentTypeBeenAccepted(documentType: DocumentTypeEnum, document: Document | GenericDocument): boolean {
    if (document && 'docTypeId' in document) {
      return document?.createdDate !== null
        && document?.documentStatus === DocumentStatusEnum.Accepted
        && document?.docTypeId === documentType
    } else {
      return document?.createdDate !== null
        && document?.documentStatus === DocumentStatusEnum.Accepted
    }
  }

  getCurrentTenant(): void {
    const user = this.authorizationService.getCurrentUser();
    this.userService.getTenant(user.email).subscribe(tenant => {
        this.tenant = tenant;
      }
    );
  }

  onFinalMedicalMenuItemClick(item: FinalMedicalReportForm, menu: string): void {
    switch (menu) {
      case 'view':
        this.captureFinalMedicalReport(item, true);
        break;
      case 'edit':
        this.captureFinalMedicalReport(item, false);
        break;
      case 'remove':
        this.openConfirmationDialog(item);
        break;
      case 'adjudicate':
        this.adjudicateFinalMedicalReport(item);
        break;
    }
  }

  onDocumentStatusMenuItemClick(menu: any, _item: FinalMedicalReportForm): void {
    // if (this.personEvent.isStraightThroughProcess) { return; }
    switch (menu.title) {
      case 'Accept':
        this.processFinalMedicalReport(_item, true, DocumentStatusEnum.Accepted);
        break;
      case 'Delete':
        this.openConfirmationDialog(_item);
        break;
      case 'Reject':
        this.openConfirmationDialogReject(_item);
        break;
      case 'Awaiting':
        this.processFinalMedicalReport(_item, true, DocumentStatusEnum.Awaiting);
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

  requestDocumentsfromHCP(claimId: number, healthcareProviderId: number, emailTemplateId: number) {
    this.claimService
      .requestDocumentsfromHCP(claimId, healthcareProviderId, emailTemplateId)
      .subscribe((result) => {
        if (result) {
          this.alertService.success('Documents requested from HCP');
          this.createNote();
          this.isLoading$.next(false)
        }
      });
  }

  createNote() {
    const claimNote = new ClaimNote();
    claimNote.personEventId = this.personEvent.personEventId;
    claimNote.text = `Documents requested from HCP for claim`;
    const currentUser = this.authorizationService.getCurrentUser();
    claimNote.createdBy = currentUser.email;
    claimNote.createdDate = new Date();
    claimNote.modifiedBy = currentUser.email;
    claimNote.modifiedDate = new Date();
    this.claimService.addClaimNote(claimNote).subscribe((result) => { });
  }
}
