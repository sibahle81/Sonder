import { Component, EventEmitter, Inject, OnInit, Output, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { BehaviorSubject, Observable, ReplaySubject, Subscription, of } from 'rxjs';
import { ToastrManager } from 'ng6-toastr-notifications';
import { LegalApiService } from '../services/legal-api.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ElementRef, ViewChild } from '@angular/core';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { takeUntil } from 'rxjs/operators';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';
import { MatTableDataSource } from '@angular/material/table';
import { DebtcareApiService } from 'projects/debtcare/src/app/debt-manager/services/debtcare-api.service';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { format } from 'date-fns';
import * as saveAs from 'file-saver';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActionDialogComponent } from '../action-dialog/action-dialog.component';
import { UploadInvoiceStatus } from 'projects/shared-models-lib/src/lib/enums/upload-invoice-status-enum';
import { DocumentUploadEnum } from 'projects/shared-models-lib/src/lib/enums/document-upload-enum';
import { LegalCareJudgementDecisionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/judgement-decision-collection-status.enum';
import { LegalCareUpdateStatusEnum } from 'projects/shared-models-lib/src/lib/enums/legalcare-update-status.enum';
import { LegalCareAssesmentDecisionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/legalcare-assesment-decision-status.enum';
import { DataService } from '../services/data.service';
import { LegalActionDialogEnum } from 'projects/shared-models-lib/src/lib/enums/legal-dialog-action-name-enum';
import { LegalModuleEnum } from 'projects/shared-models-lib/src/lib/enums/legal-module-enum';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';
import { SubActionEnum } from 'projects/shared-models-lib/src/lib/enums/sub-action-enum';
import { LegalCareReferralStatus } from 'projects/shared-models-lib/src/lib/enums/legal-recovery-status.enum';
import de from 'date-fns/locale/de';
import { EncryptionUtility } from 'projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility';
export interface invoicesDetails {
  id: number
  invoiceFile: string,
  notes: string,
  status: string,
  referralId: number,
  isDeleted: boolean,
  createdBy: string,
  createdDate: string,
  modifiedBy: string,
  modifiedDate: string,
  LegalModuleId: string,
  finPayeeId: number,
  objectionId: number
}
interface assessmentData {
  assessmentDecisionId: number
  assignId: number,
  createdBy: string,
  createdDate: string,
  departmentId: number,
  id: number
  isDeleted: boolean,
  modifiedBy: string,
  modifiedDate: string,
  notes: string,
  objectionId: number,
  referralId: number,
  status: string
}
export interface DialogData {
  action: string,
  currentModuleId: number,
  assessmentDetails: assessmentData
  details: invoicesDetails,
  email: string
}
export interface Names {
  name: string;
}
export interface recoverdPayment {
  recoverdPaymentDes: string | undefined;
  recoverdPaymenAmt: string | undefined;
  recoverdPaymenDate: Date | undefined;
  recoverdPaymenCapAmt: Date | undefined;
  recoverdPaymentContFee: string | undefined;
  recoveredPaymentDisAmt: string | undefined;
  recoveredPaymentAmtRma: string | undefined;
  recoveredPaymentAddNotes: string | undefined;
}
interface paginationParams {
  page: number,
  pageSize: number,
  orderBy: string
  sortDirection: string,
  search: string
}
interface sendEmailDetails {
  sendTo: string[],
  sendToCC: string[]
}
interface Attorney {
  id: number;
  displayName: string;
  userName: string;
  email: string;
}

export function containsSpaceValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (/^\s+$/.test(control.value) && control.value.trim() !== 'space') {
      return { containsOnlySpaces: true };
    }
    return null;
  };
}
function emailValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return null;
    }

    const re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;
    return re.test(trimmedValue) ? null : { 'invalidEmail': true };
  };
}

@Component({
  selector: 'app-common-dailog',
  templateUrl: './common-dailog.component.html',
  styleUrls: ['./common-dailog.component.css']
})
export class CommonDailogComponent extends UnSubscribe implements OnInit {

  note_text: string | undefined;
  note_text_pr: string | undefined;
  isPotentialRecv: string | undefined = "Yes";
  isRefferedBlocked: boolean | undefined;
  isTrailReady: boolean | undefined;
  statusOptions: LegalCareUpdateStatusEnum[] = [LegalCareUpdateStatusEnum.Successful, LegalCareUpdateStatusEnum.Unsuccessful, LegalCareUpdateStatusEnum.Abandoned, LegalCareUpdateStatusEnum.NotAgreedtoRAF, LegalCareUpdateStatusEnum.Repudiated];
  isInputClicked: boolean = false;
  attornyList: Attorney[] = [];
  collectionStatus: LegalCareJudgementDecisionStatusEnum[] = [LegalCareJudgementDecisionStatusEnum.Dismissed, LegalCareJudgementDecisionStatusEnum.Upheld]
  base64File: string = null;
  filename: any = null;
  enableInputs: boolean = false;
  documentPackCurrentAction: string = 'gen_att_ins';
  previousDocumentPackAction: string = '';
  attorneyInvCurrentAction: string = 'attorney_inv';
  recvPaymentCurrentAction: string = 'recv_payment';
  setMeetingCurrentAction: string = 'scheduled_meeting';
  currentIndex: number = 0;
  isExpand: boolean[] = [false];
  currentAssessment: string | undefined;
  isInfoLoading: boolean = false;
  displayedColumns: string[] = ['invoice', 'date', 'uploadedBy', 'status', 'action'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageSize: number = 5;
  page: number = 1;
  totalItems: number = 0;
  hasMoreData: boolean = true;
  currentUserId: string | undefined;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  announcer = inject(LiveAnnouncer);
  meetingType: number = SubActionEnum.schedule;
  subAction = SubActionEnum;
  LegalCareReferralStatus = LegalCareReferralStatus;
  InvoiceUploadStatus = UploadInvoiceStatus
  dept_name: string = 'Membership';
  searchText: string = '';
  searchResults: any[] = [];
  selectedItems: any[] = [];
  transferTo: any;
  transferFrom: any;
  TransferToList: any = [];
  deptList: any = [];
  maxChars: number = 1000;
  times;
  isDropdownOpenFrom;
  isDropdownOpenTo;
  filteredTimesFrom: Observable<string[]>;
  filteredTimesTo: Observable<string[]>;
  filteredTimesEditFrom: Observable<string[]>;
  filteredTimesEditTo: Observable<string[]>;
  addNotesLegalAdmin: string | undefined = null;
  addNotesPotentialRecovery: string | undefined;
  sub1: Subscription | undefined;
  updateStatusValue: string | undefined;
  updateStatusAmt: string | undefined;
  updateStatusAddNotes: string | undefined;
  invoicesData: invoicesDetails[] = [];
  addDesInvoice: string | undefined;
  recoverdPaymentField: recoverdPayment;
  recoverdPaymentDes: string | undefined;
  recoverdPaymenAmt: string | undefined;
  recoverdPaymenDate: Date | undefined;
  recoverdPaymenCapAmt: Date | undefined;
  recoverdPaymentContFee: string | undefined;
  recoveredPaymentDisAmt: string | undefined;
  recoveredPaymentAmtRma: string | undefined;
  recoveredPaymentAddNotes: string | undefined;
  genAttNotes: string | undefined;
  selectedAttorney: string | undefined;
  tempRefferralID: string | undefined;
  isRPILoading: boolean = false;
  notesForm: FormGroup;
  isNotesFormInvalid: boolean = false;
  apiParams: paginationParams | undefined;
  LegalCareAccessRoles: any
  isLogsLoading: boolean = false;
  attendeesList: any;
  legalCareUserList: any;
  meetingAgenda: any;
  MeetingId: any;
  selectedDate: any;
  timeFrom: any;
  timeTo: any;
  meetingData: any;
  judgmentDecsCollection: any;
  dateToday: Date = new Date();
  attInsId: any;
  sendEmailForm: FormGroup;
  uploadInvoiceForm: FormGroup
  pickName: string;
  submitted = false;
  number = false;
  isTextareaInvalid: boolean = false;
  formSubmitted: boolean = false;
  selectedFileName: string = 'No file selected';
  isFileSizeExceeds: boolean = false
  isSpinner: boolean = false;
  minDate = new Date();
  public emailList = [];
  public emailListCC = [];
  removable: boolean = true;
  attachments: any | undefined = null;
  fileInfo: string | undefined;
  fileInfo1: any | undefined = {};
  uploadedDocumentFiles: any = [];
  fileSource: SafeResourceUrl;
  uploadDocPackList = [];
  addedDocPackList = [];
  selectedDocumentName: string = null;
  isDocName: boolean = false;
  setMeetingForm: FormGroup;
  isAttorneyInstructionSubmitted: boolean = false;
  isUploading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  selectedDocumentSet: DocumentSetEnum;
  documentDescription = '';
  keyName: any = 'ProstheticPreAuthId'
  keyValue: any = "283985"
  @ViewChild('textAreaRef') textAreaRef: ElementRef;
  @ViewChild('uploadDocuments', { static: false }) uploadControlComponent: UploadControlComponent;
  @ViewChild('paginator') pageEvent: any;
  @ViewChild('autoInput') autoInput: ElementRef;
  @Output() requiredDocumentsUploadedEmit: EventEmitter<boolean> = new EventEmitter();
  fileSize: any;
  fileType: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  isInvalidDocType: boolean = false;
  invalideFileSize: boolean = false
  attorneyInsDocResp: any;
  tribunalMeetings: any[] = []
  assesmentForm: FormGroup;
  isCommonLoading: boolean = false;
  attendyMeetingJoinOptions: any = [];
  attendanceList: string[] = ['Present', 'Absent']
  meetingId: number;
  updatedData: any;
  hours: string[] = [];
  minutes: string[] = [];
  ampm: string[] = ['AM', 'PM'];
  judgementDecisionForm: FormGroup;
  recoveryNotesFormLegal: FormGroup;
  currentAction = LegalActionDialogEnum;
  pdfData?: any;
  ptpFileText: string | undefined = '';
  documentIdList: string[] = [];
  docUploadName: string | undefined = null;
  docFileDetails: any = {};
  documentPackID: number = null;
  filteredStatusList: string[] = [];
  filteredAttorneyList: Attorney[] = [];
  searchControl = new FormControl('');
  isAttorneyInsDocPack = false
  isNotAttorneyInsPackName = false
  claimFormStatusList: string[] = [];
  base64Output: string;
  uploadCourtOrderDocument: string = null;
  uploadDocumentProofDocument: string = null;
  UploadInvoiceDocument: string = null;
  isComma: boolean = true;
  addAmount: number = null;
  userInfo: any = {}
  showMessage: boolean = false;
  attorneyInstructions: string = '';
  currentDocPackId: number = null;
  isAddNotesRequiredError: boolean = false;
  isAttorneyNameRequiredError: boolean = false;
  private isDuplicateEmail: boolean = false;
  private isDuplicateEmailCc: boolean = false;
  documentPackSubAction: string;
  isNoDocumentAdded: boolean = false;
  isNewDocPack: boolean = false;
  isTribunalDocPackAdded: boolean = false;
  tribunalDocPackId: number = null;
  currentMeetingAction: string;
  notesDocument: string = null;

  constructor(
    public dialogRef: MatDialogRef<CommonDailogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private apiService: LegalApiService,
    private readonly toastr: ToastrManager,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private debtorApiService: DebtcareApiService,
    private readonly documentManagementService: DocumentManagementService,
    public sanitizer: DomSanitizer,
    public dataS: DataService,
    private elementRef: ElementRef
  ) {
    super();
  }
  private validateEmail(email): boolean {
    const trimmedEmail = email.trim();
    const re = /^[^\s@]+(\s?[^\s@]+)?@[^\s@]+\.[^\s@]+$/;
    return re.test(trimmedEmail);
  }

  ngOnInit(): void {
    this.getCurrentUserDetails();
    for (let i = 1; i <= 12; i++) {
      this.hours.push(i < 10 ? `0${i}` : `${i}`);
    }

    for (let i = 0; i < 60; i += 5) {
      this.minutes.push(i < 10 ? `0${i}` : `${i}`);
    }
    if (!this.data.details) {
      this.data.details = JSON.parse(localStorage.getItem('selectedItem'))
    }
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.Notes]) {
      this.getAddNotesForm();
    }
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.RecoveryNotes]) {
      this.getRecvAddNotesForm();
    }
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.PotentialRecovery]) {
      this.getPRStatus(this.data.details.referralId)
    }
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInvoices]) {
      this.getAttorneyInvoiceDetails();
      this.getInvoiceUploadForm();
    }
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.RecoveredPayment]) {
      this.getRecoveredPayment(this.data.details.referralId.toString())
    }
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.SetMeeting]) {
      this.getTribunalMeetingDetails(this.meetingType);
      this.getAttendeedList();
    }
    this.times = Array.from({ length: 24 * 4 }, (_, i) => {
      const hours = Math.floor(i / 4);
      const minutes = (i % 4) * 15;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    });

    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.DocumentPack]) {
      this.documentPackCurrentAction = 'cre_doc_pck';
      this.getDocumentPackList(this.data.details.objectionId.toString());
    }
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.SendEmail]) {
      this.getSendEmailForm(true);
    }
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.JudgementDecision]) {
      this.judgementDecisionForm = this.fb.group({
        collectionStatus: ['', Validators.required],
        addNotes: ['', [Validators.required, Validators.maxLength(1000), containsSpaceValidator()]]
      })
    }
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions]) {
      this.getNotes();
      this.getLegalCareAttourneyInstruction(this.data.details.referralId)
    }
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.Assessment]) {
      this.getAssessmentForm();
      this.getNotes();
      this.getDepartmentList('0');
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getCurrentUserDetails(): void {
    if (sessionStorage.getItem('auth-profile')) {
      this.userInfo = JSON.parse(EncryptionUtility.decryptData(sessionStorage.getItem('auth-profile')));
    }
  }

  createAttorneyInsDocumentPack() {
    this.documentPackCurrentAction = 'create_document_pack';
    this.documentPackSubAction = 'cre_doc_pck';
    if (this.currentDocPackId != null) {
      this.isNewDocPack = false;
      this.getLegalCareAttorneyInstructionDocPack(this.currentDocPackId)
    } else {
      this.isNewDocPack = true;
    }
  }

  uploadDocumentFromLocal(): void {
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions]) {
      if (!this.documentPack.controls['packName'].valid) {
        this.isNotAttorneyInsPackName = true
        return
      }
      this.attorneyInstructions == 'out_doc_pack';
      this.documentPackCurrentAction = 'create_document_pack';
      this.documentPackSubAction = 'select_from_local';
      this.isNoDocumentAdded = false;
      this.selectedDocumentName = null;
      this.docUploadName = null;
      this.filename = null;
      this.documentPack.get('document').setValue(null)
    }
  }

  selectFileFromLocal(): void {
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions]) {
      if (!this.documentPack.controls['packName'].valid) {
        this.isNotAttorneyInsPackName = true
        return
      }
      this.attorneyInstructions == 'out_doc_pack';
      this.documentPackCurrentAction = 'create_document_pack';
      this.documentPackSubAction = 'upload_doc';
    }
  }

  getAttorneyInvoiceDetails() {
    if (this.data && this.data.details && this.data.details.referralId) {
      this.isInfoLoading = true;
      this.apiParams = {
        page: this.page,
        pageSize: this.pageSize,
        orderBy: "StartDateAndTime",
        sortDirection: "asc",
        search: "0"
      }
      this.apiService.getLegalCareAttorneyInvoices(this.data.details.referralId.toString(), this.apiParams).subscribe((res: any) => {
        if (res && res['data'] != undefined) {
          this.invoicesData = res['data'] ? res['data'] : undefined;
          this.dataSource = new MatTableDataSource(res['data']);
          this.totalItems = res.rowCount;
          this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
          this.isInfoLoading = false;
        }
      })
      if (this.attorneyInvCurrentAction === 'upload_attorney_inv') {
        this.uploadInvoiceForm.reset();
        this.formSubmitted = false;
        this.isFileSizeExceeds = false;
        this.isInvalidDocType = false;
        this.invalideFileSize = false;
        this.filename = '';
        this.addDesInvoice = '';
      }
    }
  }
  handlePageinatorEventAttorneyInvoice(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getAttorneyInvoiceDetails()
  }
  getAddNotesForm(): void {
    this.notesForm = this.fb.group({
      addNotes: ['', [Validators.required, Validators.maxLength(1000), containsSpaceValidator()]]
    })
  }
  isControlInvalidLegalCollection(controlName: string): boolean {
    const control = this.notesForm.get(controlName);
    return control.invalid && (control.dirty || this.formSubmitted);
  }
  getInvoiceUploadForm() {
    this.uploadInvoiceForm = this.fb.group({
      addInvoice: ['', Validators.required],
      addAmount: ['', [Validators.required, Validators.pattern('[0-9,.\s]+\s*$')]],
      addNotes: ['', [Validators.required, Validators.maxLength(1000), containsSpaceValidator()]]
    })
  }

  getSendEmailForm(status: boolean): void {
    let sendToInitialValue = status ? this.data.details.modifiedBy : '';
    this.sendEmailForm = this.fb.group({
      sendTo: [sendToInitialValue, [Validators.required, emailValidator()]],
      sendToCc: ['', [Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      subject: ['', [Validators.required, Validators.maxLength(100), containsSpaceValidator()]],
      emailBody: ['', [Validators.required, Validators.maxLength(1000), containsSpaceValidator()]],
      attachment: [''],
      uploadDocument: ['']
    });
  }
  isControlInvalidLegalCollectionEmail(controlName: string): boolean {
    const control = this.sendEmailForm.get(controlName);
    return control.invalid && (control.dirty || this.formSubmitted);
  }
  checkValidationForNotes() {
    return this.notesForm.get('addNotes').touched && this.notesForm.get('addNotes').invalid
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close({ status: 'confirm' })
  }
  onSubmitNotes(): void {
    this.formSubmitted = true;
    if (this.notesFormLegal.valid && !this.isInvalidDocType && !this.invalideFileSize) {
      this.uploadDocumentInNotes();
    }
  }

  submitNotes(id: number): void {
    if (this.notesFormLegal.valid) {
      this.isNotesFormInvalid = false;
      this.isSpinner = true;

      let payload = {
        "LegalReferenceId": this.data.currentModuleId == LegalModuleEnum.Recovery ?
          this.data.details.referralId : this.data.currentModuleId == LegalModuleEnum.Collection ? this.data.details.id :
            this.data.currentModuleId == LegalModuleEnum.Tribunal ? this.data.details.objectionId : undefined,
        "LegalModuleId": this.data.currentModuleId,
        "Notes": this.notesFormLegal.value.addNotes,
        "DocumentUrl": id.toString()
      }
      this.apiService.sendNotes(payload).subscribe((res: any) => {
        if (res && res.data == '1') {
          this.isSpinner = false;
          this.toastr.successToastr('Notes has been submited successfully.', '', true);
          this.dialogRef.close({ status: DataResponseEnum.Success });
        } else if (res && res.data == '0') {
          this.isSpinner = false;
          this.toastr.errorToastr('Error while adding notes', '', true);
        } else {
          this.isSpinner = false;

        }
      })
    } else {
      this.isNotesFormInvalid = true;
    }
  }

  submitRecoveryNotes(): void {
    if (this.recoveryNotesFormLegal.valid) {
      this.isNotesFormInvalid = false;
      this.isSpinner = true;

      let payload = {
        "LegalReferenceId": this.data.currentModuleId == LegalModuleEnum.Recovery ?
          this.data.details.referralId : this.data.currentModuleId == LegalModuleEnum.Collection ? this.data.details.id :
            this.data.currentModuleId == LegalModuleEnum.Tribunal ? this.data.details.objectionId : undefined,
        "LegalModuleId": this.data.currentModuleId,
        "Notes": this.recoveryNotesFormLegal.value.addNotes,
      }
      this.apiService.sendNotes(payload).subscribe((res: any) => {
        if (res && res.data == '1') {
          this.isSpinner = false;
          this.toastr.successToastr('Notes has been submited successfully.', '', true);
          this.dialogRef.close({ status: DataResponseEnum.Success });
        } else if (res && res.data == '0') {
          this.isSpinner = false;
          this.toastr.errorToastr('Error while adding notes', '', true);
        } else {
          this.isSpinner = false;

        }
      })
    } else {
      this.isNotesFormInvalid = true;
    }
  }

  selectFromLocal(key: string): void {
    this.documentPackSubAction = 'upload_doc'
  }

  notesFormLegal = this.fb.group({
    addNotes: ['', [Validators.required, Validators.maxLength(1000), containsSpaceValidator()]],
    courtOrder: ['', [Validators.required]]
  })
  isControlInvalid(controlName: string): boolean {
    const control = this.notesFormLegal.get(controlName);
    return control.invalid && (control.dirty || this.formSubmitted);
  }

  getRecvAddNotesForm(): void {
    this.recoveryNotesFormLegal = this.fb.group({
      addNotes: ['', [Validators.required, Validators.maxLength(1000), containsSpaceValidator()]],
    })
  }
  recovNotesControlInvalid(controlName: string): boolean {
    const control = this.recoveryNotesFormLegal.get(controlName);
    return control.invalid && (control.dirty || this.formSubmitted);
  }

  onSubmitPotentialRecovery(): void {
    this.formSubmitted = true;
    if (this.potntialRecoveryForm.valid) {
      if (this.isPotentialRecv) {
        let payload = {
          IsPotentialRecovery: this.isPotentialRecv === 'No' ? false : true,
          PotentialNotes: this.potntialRecoveryForm.value.addNotes,
          ReferralId: this.data.details.referralId
        }
        this.isSpinner = true;
        this.apiService.submitPotentialRecovery(payload).subscribe((res: any) => {
          if (res && res.data == '1') {
            this.toastr.successToastr('Submited successfully.', '', true);
            this.dialogRef.close({ status: DataResponseEnum.Success });
            this.isSpinner = false;
          } else if (res && res.data == '0') {
            this.toastr.errorToastr('Error', '', true);
            this.isSpinner = false;
            this.textAreaRef.nativeElement.focus();
          } else {
            this.isSpinner = false;
          }
        })
      }

    }
  }

  potntialRecoveryForm = this.fb.group({
    potentialRecovery: [{ value: 'No' }, Validators.required],
    addNotes: ['', [Validators.required, Validators.maxLength(1000), containsSpaceValidator()]]
  })
  isControlInvalidPotential(controlName: string): boolean {
    const control = this.potntialRecoveryForm.get(controlName);
    return control.invalid && (control.dirty || this.formSubmitted);
  }

  onSubmitAssesment(): void {
    this.formSubmitted = true;
    if (this.assesmentForm.valid) {
      let tribunalAssessment = {
        ObjectionId: this.data.currentModuleId == LegalModuleEnum.Collection ? this.data.details.finPayeeId : this.data.currentModuleId == LegalModuleEnum.Tribunal ? this.data.details.objectionId : this.data.details.referralId,
        AssessmentDecisionId: this.currentAssessment == LegalCareAssesmentDecisionStatusEnum[LegalCareAssesmentDecisionStatusEnum.ReferredBack] ? LegalCareAssesmentDecisionStatusEnum.ReferredBack : LegalCareAssesmentDecisionStatusEnum.TrialReady,
        DepartmentId: this.LegalCareAccessRoles.moduleId,
        AssignId: this.currentUserId ? this.currentUserId : '0',
        Notes: this.note_text_pr
      }

      this.isSpinner = true;
      this.apiService.AddTribunalAssessment(tribunalAssessment).subscribe((res: any) => {

        if (res && res.data == DataResponseEnum.Success) {
          this.toastr.successToastr('Tribunal Assessment has been submitted successfully.', '', true);
          this.isSpinner = false;
          this.dialogRef.close({ status: DataResponseEnum.Success });
          this.assesmentForm.reset();
        } else {
          this.isSpinner = false;
          this.toastr.errorToastr('Tribunal Assessment was not created successfully, please try again!')
        }
      })
    }
  }
  getAssessmentForm(): void {
    let tempAssessment: assessmentData = this.data.assessmentDetails;
    if (tempAssessment.departmentId) {
      this.getDepartmentUserList(tempAssessment.departmentId);
    }


    this.assesmentForm = this.fb.group({
      assesmentDecision: [tempAssessment.assessmentDecisionId ? tempAssessment.assessmentDecisionId == 1 ? 'No' : 'Yes' : null, Validators.required],
      transferFrom: [tempAssessment.departmentId ? tempAssessment.departmentId : null, Validators.required],
      transferTo: [tempAssessment.assignId && tempAssessment.assignId != 0 ? tempAssessment.assignId : null],
      // addNotes: ['', [Validators.required, Validators.maxLength(1000), containsSpaceValidator()]]
      addNotes: [tempAssessment.notes ? tempAssessment.notes : null, [Validators.required, Validators.maxLength(1000), containsSpaceValidator()]]
    })

    this.note_text_pr = tempAssessment.notes ? tempAssessment.notes : null;

    if (tempAssessment.assessmentDecisionId && tempAssessment.assessmentDecisionId == 1) {
      this.currentAssessment = LegalCareAssesmentDecisionStatusEnum[LegalCareAssesmentDecisionStatusEnum.ReferredBack]
    } else {
      this.currentAssessment = ''
    }
  }

  isControlInvalidTribunalAssesement(controlName: string): boolean {
    const control = this.assesmentForm.get(controlName);
    return control.invalid && (control.dirty || this.formSubmitted);
  }

  updateRecoveryStatus(): void {
    this.formSubmitted = true;
    this.isSpinner = true;

    if (this.updateStatusForm.valid && !this.isInvalidDocType && !this.invalideFileSize) {

      let payload = {
        UpdateStatus: this.updateStatusValue,
        updateStatusNote: this.updateStatusAddNotes,
        ReferralId: this.data.details.referralId,
        offerAmount: this.updateStatusForm.value.amount,
        courtOrder: this.updateStatusForm.value.uploadCourtOrder
      }

      this.apiService.updateRecoveryStatus(payload).subscribe((res: any) => {
        if (res && res.data == '1') {
          this.isSpinner = false;

          this.toastr.successToastr('Status Updated successfully.', '', true);
          this.dialogRef.close({ status: DataResponseEnum.Success });
        } else if (res && res.data == '0') {
          this.isSpinner = false;
          this.toastr.errorToastr('Error', '', true);
        }
      })
    } else {
      this.isSpinner = false;

    }
  }

  uploadInvoice(): void {
    this.formSubmitted = true;
    this.isFileSizeExceeds = true;
    this.isSpinner = true;
    if (this.uploadInvoiceForm.valid && !this.isInvalidDocType && !this.invalideFileSize) {
      if (this.addDesInvoice) {

        const timeStamp = format(new Date(), 'yyMMddHMs')
        const keysObject = { "AttorneyInvoicesId": timeStamp };
        const request = {
          docTypeId: DocumentUploadEnum.DocTypeId,
          systemName: "RevoceryAttorneyInvoices",
          fileName: this.filename,
          keys: keysObject,
          documentStatus: DocumentUploadEnum.DocumentStatus,
          documentStatusText: DocumentUploadEnum[DocumentUploadEnum.Received],
          fileExtension: "application/pdf",
          documentSet: DocumentUploadEnum.DocumentSet,
          documentDescription: this.docUploadName != null ? this.docUploadName : 'New',
          fileAsBase64: this.UploadInvoiceDocument
        };

        let payload = {
          InvoiceFile: this.filename,
          ReferralId: this.data.details.referralId,
          Notes: this.addDesInvoice,
          Amount: this.uploadInvoiceForm.value.addAmount,
          legalCareInvoiceApprovalStatus: UploadInvoiceStatus.Pending,
          InvoiceDocumentDoc: { ...request }
        }

        this.apiService.addLegalCareInvoice(payload).subscribe((res: any) => {
          if (res && res.data == '1') {
            this.isSpinner = false;
            this.isFileSizeExceeds = false;
            this.toastr.successToastr('Invoice has been uploaded successfully.', '', true);
            this.getAttorneyInvoiceDetails();
            this.attorneyInvCurrentAction = 'attorney_inv';
            this.dataS.setCurrentStatus(DataResponseEnum.Success)

          } else if (res && res.data == '0') {
            this.isSpinner = false;
            this.isFileSizeExceeds = true;
            this.toastr.errorToastr('Error', '', true);
          }
        })
      }
    } else {

      this.isSpinner = false;

    }

  }

  isControlInvalidLegalUploadInvoice(controlName: string): boolean {
    const control = this.uploadInvoiceForm.get(controlName);
    control.markAsTouched();
    return control.invalid && this.formSubmitted;
  }

  getPRStatus(id: number): void {
    this.isSpinner = true;
    this.apiService.getLegalcareSavedRefferalData(id).subscribe((res: any) => {
      if (res) {
        this.isSpinner = false;
        this.isPotentialRecv = res.isPotentialRecovery ? 'Yes' : 'No'
        this.potntialRecoveryForm.get('addNotes').setValue(res.potentialNotes)
      } else {
      }
    })
  }



  getRecoveredPayment(id: string) {
    if (this.data && this.data.details && this.data.details.referralId) {

      this.apiParams = {
        page: this.page,
        pageSize: this.pageSize,
        orderBy: "StartDateAndTime",
        sortDirection: "asc",
        search: "0"
      }
      this.isRPILoading = true;
      this.apiService.getLegalRecoveredPayment(this.data.details.referralId.toString(), this.apiParams).subscribe((res: any) => {
        if (res) {
          this.invoicesData = res['data']

          this.dataSource = new MatTableDataSource(res['data']);
          this.totalItems = res.rowCount;
          this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
          this.isRPILoading = false;

        }
      })
      if (this.recvPaymentCurrentAction === 'add_payment') {
        this.addPaymentForm.reset();
        this.formSubmitted = false;
        this.isFileSizeExceeds = false;
        this.isInvalidDocType = false;
        this.invalideFileSize = false;
        this.filename = '';
        this.recoveredPaymentAddNotes = '';
      }
    }
  }
  handlePageinatorEventRecoveredPayment(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getRecoveredPayment(this.data.details.referralId.toString())

  }
  onAddPayment(): void {
    this.formSubmitted = true;
    let paymentDate = (format(new Date(this.addPaymentForm.value.date), "yyyy-MM-dd'T'HH:mm:ss")).toString() + ".000Z"
    this.isSpinner = true;

    if (this.addPaymentForm.valid && !this.isInvalidDocType && !this.invalideFileSize) {
      const timeStamp = format(new Date(), 'yyMMddHMs')
      const keysObject = { "AttorneyRecoveredPaymentId": timeStamp };
      const request = {
        docTypeId: DocumentUploadEnum.DocTypeId,
        systemName: "RecoverdPayment",
        fileName: this.filename,
        keys: keysObject,
        documentStatus: DocumentUploadEnum.DocumentStatus,
        documentStatusText: DocumentUploadEnum[DocumentUploadEnum.Received],
        fileExtension: "application/pdf",
        documentSet: DocumentUploadEnum.DocumentSet,
        documentDescription: this.docUploadName != null ? this.docUploadName : 'New',
        fileAsBase64: this.UploadInvoiceDocument
      };

      let payload = {
        ReferralId: this.data.details.referralId,
        File: this.filename,
        Amount: this.addPaymentForm.value.amount,
        Date: paymentDate,
        CapitalAmount: this.addPaymentForm.value.capitalAmount,
        contigencyFees: this.addPaymentForm.value.contigencyFees,
        RMAAmount: this.addPaymentForm.value.amountRMA,
        DisbursedAmount: this.addPaymentForm.value.disbursedAmount,
        Notes: this.recoveredPaymentAddNotes,
        RecoveredPaymentDoc: { ...request }
      }
      this.apiService.addRecoveredPaymentDetails(payload).subscribe((res: any) => {
        try {
          if (res && res.data == '1') {
            this.toastr.successToastr('Payment Added Successfully.', '', true);
            this.getRecoveredPayment(this.data.details.referralId.toString());
            this.recvPaymentCurrentAction = 'recv_payment';
            this.dataS.setCurrentStatus(DataResponseEnum.Success)
            this.isSpinner = false;
          } else if (res && res.data == '0') {
            this.toastr.errorToastr('Error', '', true);
            this.isSpinner = false;
          } else {
            this.isSpinner = false;
          }
        }
        catch (err) {
        }
      })
    } else {
      this.isSpinner = false;
    }
  }
  addPaymentForm = this.fb.group({
    uploadProof: ['', Validators.required,],
    amount: ['', [Validators.required, Validators.pattern('[0-9,.\s]+\s*$')]],
    date: ['', Validators.required],
    capitalAmount: ['', [Validators.required, Validators.pattern('[0-9,.\s]+\s*$')]],
    contigencyFees: ['', [Validators.required, Validators.pattern('[0-9,.\s]+\s*$')]],
    disbursedAmount: ['', [Validators.required, Validators.pattern('[0-9,.\s]+\s*$')]],
    amountRMA: ['', [Validators.required, Validators.pattern('[0-9,.\s]+\s*$')]],
    addNotes: ['', [Validators.required, Validators.maxLength(1000), containsSpaceValidator()]]
  })



  isControlInvalidAddPayment(controlName: string): boolean {
    const control = this.addPaymentForm.get(controlName);
    control.markAsTouched();
    return this.formSubmitted && control.invalid;
  }
  selectAttorney(value: string, index: number) {
    this.selectedAttorney = value;
    this.isAttorneyNameRequiredError = false;
  }

  updateDocumentPack(status: boolean = false): void {
    if (this.documentPackID != null) {
      this.showMessage = false
      if (this.uploadDocPackList?.length > 0) {
        this.isNoDocumentAdded = false;
        const documentIdList = this.uploadDocPackList.map((item) => item.id)
        const payload = {
          Id: this.documentPackID,
          DocumentIds: documentIdList.join(','),
          ReferralId: this.data?.details?.referralId.toString(),
          PackName: this.attorneyInstructionForm.value.documentPack
        }
        this.isSpinner = true;
        this.apiService.updateLegalCareRecovery(payload).subscribe((res: any) => {
          if (res && res.data == DataResponseEnum.Success) {
            this.isSpinner = false;
            this.attorneyInstructions = 'out_doc_pack'
            this.documentPackCurrentAction = 'gen_att_ins'
            if (!status) {
              this.toastr.successToastr('Document Pack has been created successfully.', '', true);
            }
            this.attorneyInstructionForm.get('documentPack').setValue(this.documentPack.value.packName)
          } else {
            this.isSpinner = false;
            this.toastr.errorToastr(res.message, '', true);
          }
        })
      } else {
        this.showMessage = true;
      }
    }
  }

  updateLegalCareTribunal(): void {
    if (this.tribunalDocPackId != null) {
      if (this.uploadDocPackList?.length > 0) {
        this.isNoDocumentAdded = false;
        const documentIdList = this.uploadDocPackList.map((item) => item.id)


        const payload = {
          Id: this.tribunalDocPackId,
          PackName: this.documentPack.value.packName,
          DocumentIds: documentIdList.join(','),
          ObjectionId: this.data.details.objectionId,
        }

        this.isSpinner = true;
        this.apiService.updateLegalCareTribunalDocPack(payload).subscribe((res: any) => {
          if (res && res.data == DataResponseEnum.Success) {
            this.isSpinner = false;
            this.toastr.successToastr('Document Pack has been created successfully.', '', true);
            this.dialogRef.close({ status: DataResponseEnum.Success });
          } else {
            this.isSpinner = false;
            this.toastr.errorToastr(res.message, '', true);
          }
        })
      }
    }
  }

  generateAttorneyInstructions(): void {

    this.isAttorneyInstructionSubmitted = true;
    this.isAddNotesRequiredError = this.attorneyInstructionForm.get('addNotes').hasError('required') && this.isControlInvalidAttorneyInstruction('addNotes');
    this.isAttorneyNameRequiredError = this.attorneyInstructionForm.get('attorney').hasError('required');



    if (!this.isAddNotesRequiredError && this.attorneyInstructionForm.get('documentPack').invalid) {
      this.formSubmitted = true;
    }
    if (this.attorneyInstructionForm.valid) {
      const payload = {
        AttorneyId: this.attorneyInstructionForm.value.attorney,
        DocPackId: this.documentPackID,
        Notes: this.attorneyInstructionForm.value.addNotes,
        ReferralId: this.data.details.referralId.toString(),
        CourtOrder: ""
      }
      this.isSpinner = true;
      this.apiService.addAttorneyInstructions(payload).subscribe((res: any) => {
        if (res && res.data == 1) {
          this.isSpinner = false;
          this.toastr.successToastr('Attorney Instruction has been generated', '', true)
          this.dialogRef.close({ status: DataResponseEnum.Success });
        } else {
          this.toastr.errorToastr(res.mssage, '', true)
          this.isSpinner = false;
          this.dialogRef.close();
        }
      });
      this.updateDocumentPack(true);
    } else {
      this.showMessage = true;
    }
  }

  isControlInvalidAttorneyInstruction(controlName: string): boolean {
    const control = this.attorneyInstructionForm.get(controlName);
    control.markAsTouched();
    return control.invalid && this.formSubmitted;
  }

  attorneyInstructionForm = this.fb.group({
    attorney: ['', Validators.required],
    documentPack: ['', Validators.required],
    addNotes: ['', [Validators.required, Validators.maxLength(1000), containsSpaceValidator()]]
  })


  onSubmitPR(): void {
    this.formSubmitted = true;


    if (this.documentPack.valid) {

    }
    this.dialogRef.close({ data: this.note_text_pr, pr_value: this.isPotentialRecv })
  }

  documentPack = this.fb.group({
    packName: ['', Validators.required],
    document: ['', Validators.required]
  })
  isControlInvalidTribunaldocPack(controlName: string): boolean {
    const control = this.documentPack.get(controlName);
    return control.invalid && (control.dirty || this.formSubmitted);
  }

  createDocumentPack() {

    this.formSubmitted = true
  }
  onSelectValue(e: Event): void {
    let value: string = e.toString();
    if (value && value == LegalCareUpdateStatusEnum.Successful.toString()) {
      this.enableInputs = true;
    } else {
      this.enableInputs = false;
      this.filename = undefined;
      this.updateStatusAmt = undefined;

      this.updateStatusForm.get('uploadCourtOrder').clearValidators()
      this.updateStatusForm.get('uploadCourtOrder').updateValueAndValidity()

      this.updateStatusForm.get('amount').clearValidators()
      this.updateStatusForm.get('amount').updateValueAndValidity()
    }

    this.getDepartmentUserList(value.toString());
  }
  getStatusText(status: number): string {
    switch (status) {
      case LegalCareUpdateStatusEnum.Successful:
        return LegalCareUpdateStatusEnum[`${status}`];
      case LegalCareUpdateStatusEnum.Unsuccessful:
        return LegalCareUpdateStatusEnum[`${status}`];
      case LegalCareUpdateStatusEnum.Abandoned:
        return LegalCareUpdateStatusEnum[`${status}`];
      case LegalCareUpdateStatusEnum.NotAgreedtoRAF:
        return LegalCareUpdateStatusEnum[`${status}`];
      default:
        return 'Unknown Status';
    }
  }
  onSelectUser(e: Event): void {
    this.currentUserId = e.toString();
  }

  onSelectStatus(index: number) {
    this.updateStatusValue = (index + 1).toString();
    this.tempRefferralID = "40"
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      let file = files[0];

      const fReader = new FileReader()
      fReader.readAsDataURL(file)
      fReader.onloadend = (_event: any) => {
        this.filename = file.name;
        this.fileType = file.type
        this.fileSize = file.size
        this.selectedFileName = this.filename
        this.checkFileType();
        this.checkFileSize();
        this.base64File = _event.target.result.split(',')[1];
        this.UploadInvoiceDocument = this.base64File;
        this.uploadDocumentProofDocument = this.base64File
        this.uploadCourtOrderDocument = this.base64File
      }
    }
  }

  uploadCourtOrder(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.onFileSelect(event);
    }
  }

  uploadDocumentForProof(event: any): void {
    this.onFileSelect(event);
  }

  uploadInvoiceDocument(event: any): void {
    this.onFileSelect(event);
  }


  checkFileType() {
    const allowedTypes = ['application/pdf']
    if (allowedTypes.includes(this.fileType)) {
      this.isInvalidDocType = false
    } else {
      this.isInvalidDocType = true

    }

  }

  checkFileSize() {
    const allowedFileSize = (this.fileSize / 1048576) <= 2.0
    if (allowedFileSize) {
      this.invalideFileSize = false
    } else {
      this.invalideFileSize = true
    }
  }


  onSelect(currentPage: string): void {
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions]) {
      if (!this.documentPack.controls['packName'].valid) {
        this.isNotAttorneyInsPackName = true
        return
      } else {
        if (currentPage == 'att_ins_final') {
          this.documentPackCurrentAction = 'cre_doc_pck';
          this.attorneyInstructions = 'in_doc_pack'
        }
        else if (currentPage == 'select_from_local') {
          this.documentPackCurrentAction = currentPage;
          this.attorneyInstructions = 'out_doc_pack';
        }
        else {
          this.documentPackCurrentAction = currentPage;
        }
        this.isNotAttorneyInsPackName = false
      }
    } else if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.DocumentPack]) {
      if (currentPage == 'att_ins_final') {
        this.documentPackCurrentAction = 'cre_doc_pck';
        this.attorneyInstructions = 'in_doc_pack'
      } else {
        this.documentPackCurrentAction = currentPage;
      }
      this.filename = null;
      this.docUploadName = null;
      this.documentPack.get('document').setValue(null)
      this.selectedDocumentName = null;
    } else {
      if (this.documentPackCurrentAction === 'gen_att_ins') {
        this.previousDocumentPackAction = this.documentPackCurrentAction;
      }
      this.documentPackCurrentAction = currentPage;
      this.docUploadName = null;
      this.selectedDocumentName = null
    }
  }

  onSelectAttInv(currentPage: string): void {

    this.attorneyInvCurrentAction = currentPage;
    this.uploadInvoiceForm.reset();
  }

  showDocuments(index: number): void {
    this.currentIndex = index;
    this.isExpand[index] = !this.isExpand[index];
  }

  onSelectRecvPayment(currentPage: string): void {

    this.recvPaymentCurrentAction = currentPage;
    this.addPaymentForm.reset();
  }

  onSelectMeeting(currentPage: string): void {
    this.setMeetingCurrentAction = currentPage;
    if (this.setMeetingCurrentAction == 'schedule_new_meeting') {
      this.getSetMeetingForm();
      this.selectedItems = [];
      this.filename = null;
      this.getAttendeedList()
    }
  }

  getAttendeedList() {
    this.apiService.getLegalCareUserList().subscribe((res: any) => {
      if (res) {
        this.legalCareUserList = res.data;
        this.attendeesList = res.data[0];
      }
    })
  }

  uploadFromLocal(key: string): void {

    this.dialogRef.close({ data: key, key: key })
    this.checkFileType();
    this.checkFileSize();

  }
  selectMeetingType(type: number): void {
    this.meetingType = type;
    this.isLogsLoading = true
    this.apiService.getScheduleOrCompletedMeetings(SubActionEnum[this.meetingType]).subscribe((res: any) => {
      this.isLogsLoading = false
      if (res) {
        this.invoicesData = res['data']

      }
    })
  }

  showDetails(data: any): void {
    this.meetingData = data
    this.meetingType = SubActionEnum.attendeed
    this.isSpinner = true;
    this.apiService.getMeetingAttendees(data.id).subscribe((res: any) => {
      if (res && res['data']) {
        this.isSpinner = false;
        this.attendyMeetingJoinOptions = res['data']
      } else {
        this.isSpinner = false;
      }
    })
  }

  onSelectAssessment(status: string): void {
    this.currentAssessment = status;
    if (this.currentAssessment == LegalCareAssesmentDecisionStatusEnum[LegalCareAssesmentDecisionStatusEnum.TrialReady]) {

      this.assesmentForm.get('transferFrom').clearValidators();
      this.assesmentForm.get('transferFrom').setValue(null);

    } else {

      this.assesmentForm.get('transferFrom').addValidators(Validators.required);
      this.assesmentForm.get('transferFrom').setValue(0);
    }
  }

  getNotes() {
    this.isLogsLoading = true
    this.apiService.getLegalCareAccessRoles(this.userInfo?.email).subscribe((res: any) => {
      this.isLogsLoading = false
      if (res) {
        this.LegalCareAccessRoles = res.data[0];
        if (this.LegalCareAccessRoles.moduleId && this.LegalCareAccessRoles.permissionGroupId) {
          this.getAttorneyList(this.LegalCareAccessRoles.moduleId, this.LegalCareAccessRoles.permissionGroupId)
        }
      }
    })
  }

  onSubmitJD(): void {
    this.formSubmitted = true;

    if (this.judgementDecisionForm.valid) {

      let judgementDecision = {
        "ObjectionId": this.data.details.objectionId,
        "CollectionStatus": this.judgementDecisionForm.value.collectionStatus.toString(),
        "Notes": this.judgementDecisionForm.value.addNotes
      }
      this.isSpinner = true;
      this.apiService.addJudgementDecision(judgementDecision).subscribe((res: any) => {
        if (res && res.data == '1') {
          this.toastr.successToastr('Judgement decision has been submited successfully.', '', true);
          this.isSpinner = false;
          this.dialogRef.close({ status: DataResponseEnum.Success })
        } else {
          this.isSpinner = false;
          this.toastr.errorToastr('Judgement decision was not created successfully, please try again!')
        }
      })
    }
  }
  isControlInvalidLegaljudgment(controlName: string): boolean {
    const control = this.judgementDecisionForm.get(controlName);
    control.markAsTouched();
    return control.invalid && this.formSubmitted;
  }
  editMeeting(meeting) {
    const emailArray = meeting.attendeesEmail.split(',').map((email) => email.trim());

    const attendeesEmailArray = meeting.attendeesEmail.split(',').map(email => email.trim());
    const attendeesNameArray = meeting.attendeesName.split(',').map(name => name.trim());

    const combinedArray = attendeesEmailArray.map((email, index) => ({
      attendeesEmail: email,
      attendeesName: attendeesNameArray[index]
    }));
    this.editMeetingForm.get('packName').clearValidators();
    this.currentMeetingAction = SubActionEnum[SubActionEnum.edit];

    combinedArray.forEach((obj) => {
      this.patchEmailToSelectedItems(obj, SubActionEnum[SubActionEnum.edit]);
    })
    this.pickName = ''
    const timeFromString = meeting.timeFrom;
    const dateObjFrom = new Date(timeFromString);
    const timeToString = meeting.timeTo;
    const dateObjTo = new Date(timeToString);
    this.setMeetingCurrentAction = "edit_schedule_meeting"
    this.meetingAgenda = meeting.description;
    this.meetingId = meeting.id;
    this.filename = meeting.refDocument;
    this.selectedDate = meeting.date;
    this.timeFrom = dateObjFrom.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.timeTo = dateObjTo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  deleteMeeting(meeting) {
    this.isLogsLoading = true
    this.apiService.deleteTribunalMeeting(meeting.id.toString()).subscribe((res: any) => {
      if (res && res.data == '1') {
        this.toastr.successToastr('Meeting has been deleted successfully.', '', true);
        this.getTribunalMeetingDetails(SubActionEnum.schedule);
        this.isLogsLoading = false;
        this.isSpinner = false;
      } else {
        this.toastr.errorToastr('Meeting deletion unsuccessfully, please try again!');
        this.isLogsLoading = false
      }
    })
  }



  save() {
    this.isUploading$.next(true);
    const uploadedFiles = this.uploadControlComponent.getUploadedFiles();
    for (const file of uploadedFiles) {
      const document = new Document();
      document.fileExtension = file.file.type;
      document.fileName = file.name;
      document.keys = this.getKeys();
      document.documentStatus = DocumentStatusEnum.Received;
      document.documentSet = DocumentSetEnum[this.selectedDocumentSet];
      document.documentDescription = this.documentDescription;
      document.systemName = DocumentSystemNameEnum['DebtCareSignDocument'];
      const reader = new FileReader();
      reader.onload = () => {
        document.fileAsBase64 = reader.result.toString();
        this.documentManagementService.UploadDocument(document).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
          const document = new GenericDocument();
        });
      };
      reader.readAsDataURL(file.file);
    }
  }

  getKeys(): { [key: string]: string } {
    return { [this.keyName]: `${this.keyValue}` };
  }

  getDocumentType(documentType: DocumentTypeEnum): string {
    return this.formatText(DocumentTypeEnum[documentType]);
  }

  formatText(text: string): string {
    return text ? text.replace(/([A-Z])/g, ' $1').trim() : '<value missing from enum>';
  }
  addNotesTribunal() {
    this.formSubmitted = true
    if (this.noteFormTribunal.valid) {
    }
  }
  updateStatusForm = this.fb.group({
    status: ['', Validators.required],
    uploadCourtOrder: ['', [Validators.required]],
    amount: ['', [Validators.required, Validators.pattern('[0-9.,\s]+\s*$')]],
    addNotes: ['', [Validators.required, Validators.maxLength(1000), containsSpaceValidator()]]
  })
  isControlInvalidUpdateStatus(controlName: string): boolean {
    const control = this.updateStatusForm.get(controlName);

    const shouldMarkAsTouched = control.invalid && this.formSubmitted;

    if (shouldMarkAsTouched) {
      control.markAsTouched();
    }

    return control.invalid && this.formSubmitted;
  }

  validationForUploadCourtOrder() {
    return this.updateStatusForm.get('uploadCourtOrder').invalid
  }

  validationForAmount() {
    return this.updateStatusForm.get('amount').invalid
  }

  validateForAmountPattern() {
    return this.updateStatusForm.get('amount').errors.pattern
  }

  validateForAddNotes() {
    return this.updateStatusForm.get('addNotes').invalid
  }
  noteFormTribunal = this.fb.group({
    addNotes: ['', [Validators.required, Validators.maxLength(1000), containsSpaceValidator()]]
  })

  notesValidationTribunal() {
    return this.noteFormTribunal.get('addNotes').invalid
  }
  validateAssesmentDecision() {
    return this.assesmentForm.get('assesmentDecision').invalid
  }

  validateTransferFrom() {
    return this.assesmentForm.get('transferFrom').touched && this.assesmentForm.get('transferFrom').invalid
  }

  validateTransferTo() {
    return this.assesmentForm.get('transferTo').touched && this.assesmentForm.get('transferTo').invalid
  }

  validateNotes() {
    return this.assesmentForm.get('addNotes').touched && this.assesmentForm.get('addNotes').invalid
  }

  onScheduleMeeting() {
    this.formSubmitted = true
    if (this.setMeetingForm.valid && !this.isInvalidDocType && !this.invalideFileSize) {
      let tempDate = this.setMeetingForm.controls['date'].value
      let formattedDate = format(new Date(tempDate), 'yyyy-MM-dd')
      const timeStamp = format(new Date(), 'yyMMddHMs')
      const attorneyInstructions = this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions];
      const keysObject = { "MeetingId": timeStamp }

      const request = {
        docTypeId: DocumentUploadEnum.DocTypeId,
        systemName: "MeetingsRefDocument",
        fileName: this.filename,
        keys: keysObject,
        documentStatus: DocumentUploadEnum.DocumentStatus,
        documentStatusText: DocumentUploadEnum[DocumentUploadEnum.Received],
        fileExtension: "application/pdf",
        documentSet: DocumentUploadEnum.DocumentSet,
        documentDescription: this.docUploadName != null ? this.docUploadName : 'New',
        fileAsBase64: this.UploadInvoiceDocument
      };


      let scheduleMeeting = {
        ObjectionId: this.data.details.objectionId,
        Date: formattedDate,
        TimeFrom: '',
        TimeTo: '',
        Status: "Schedule",
        Description: this.setMeetingForm.controls['meetingTitle'].value,
        RefDocument: this.setMeetingForm.controls['uploadDocument'].value,
        Attendies: this.selectedItems.map(item => item.email).join(','),
        MeetingRefDoc: { ...request }
      }


      scheduleMeeting.TimeFrom = formattedDate + 'T' + this.setMeetingForm.controls['timeFrom'].value + ":" + '00.000Z'
      scheduleMeeting.TimeTo = formattedDate + 'T' + this.setMeetingForm.controls['timeTo'].value + ":" + '00.000Z',
        this.isSpinner = true
      this.apiService.addScheduleMeeting(scheduleMeeting).subscribe((res: any) => {
        this.isSpinner = false
        if (res && res.data == '1') {
          this.toastr.successToastr('Meeting has been scheduled successfully.', '', true);
          this.isSpinner = false;
          this.setMeetingCurrentAction = 'scheduled_meeting'
          this.getTribunalMeetingDetails(this.meetingType);
          this.pickName = ' ';
          this.setMeetingForm.reset();
          this.setMeetingForm.get('packName').setValue(null)
        } else {
          this.toastr.errorToastr('Meeting was not scheduled successfully, please try again!')
        }
      })
    }


  }

  onEditScheduleMeeting() {
    this.formSubmitted = true;

    if (this.editMeetingForm.valid && !this.isInvalidDocType && !this.invalideFileSize) {
      let tempDate = this.editMeetingForm.controls['date'].value
      let formattedDate = format(new Date(tempDate), 'yyyy-MM-dd')
      let scheduleMeeting = {
        ObjectionId: this.data.details.objectionId,
        Date: tempDate,
        TimeFrom: formattedDate + 'T' + this.editMeetingForm.controls['timeFrom'].value + ":" + '00.000Z',
        TimeTo: formattedDate + 'T' + this.editMeetingForm.controls['timeTo'].value + ":" + '00.000Z',
        Status: "Schedule",
        Description: this.editMeetingForm.controls['meetingTitle'].value,
        RefDocument: this.editMeetingForm.controls['uploadDocument'].value,
        Id: this.meetingId,
        Attendies: this.selectedItems.map(item => item.email).join(',')

      }
      this.isSpinner = true
      this.apiService.editScheduleMeeting(this.meetingId, scheduleMeeting).subscribe(
        (response) => {
          this.updatedData = this.editMeetingForm.value;
          this.toastr.successToastr('Meeting has been updated successfully.', '', true);
          this.isSpinner = false;
          this.setMeetingCurrentAction = 'scheduled_meeting'
          this.getTribunalMeetingDetails(this.meetingType);
          this.editMeetingForm.reset();
          this.editMeetingForm.get('packName').setValue(null)
        },
        (error) => {
          this.isSpinner = false
          this.toastr.errorToastr('Meeting was not updated successfully, please try again!')
        }
      );
    }
  }

  processAttendeeNames(attendeeNames: string): { displayedEmails: string[], remainingCount: number } {
    const emailArray = attendeeNames.split(',').map((email) => email.trim());
    const displayedEmails = emailArray.slice(0, 4);
    const remainingCount = emailArray.length - 4;
    return { displayedEmails, remainingCount };
  }

  getSetMeetingForm(): void {
    this.setMeetingForm = this.fb.group({
      meetingTitle: ['', Validators.required],
      date: ['', Validators.required],
      packName: [[], Validators.required],
      uploadDocument: ['', Validators.required],
      timeFrom: ['', Validators.required],
      timeTo: ['', Validators.required]

    })
  }

  editMeetingForm = this.fb.group({
    meetingTitle: ['', Validators.required],
    date: ['', Validators.required],
    packName: [[]],
    uploadDocument: ['', Validators.required],
    timeFrom: ['', Validators.required],
    timeTo: ['', Validators.required]

  })
  getPickNameValidators(formType: any = null) {
    const packNameControl = formType == SubActionEnum[SubActionEnum.edit] ? this.editMeetingForm.get('packName') : this.setMeetingForm.get('packName');

    if (this.selectedItems.length > 0) {
      packNameControl?.clearValidators();
    } else {
      packNameControl?.setValidators(Validators.required);
    }
    packNameControl?.updateValueAndValidity();
  }

  isControlInvalidLegalSetMeeting(controlName: string): boolean {
    const control = this.editMeetingForm?.get(controlName);
    control.markAsTouched();
    return control.invalid && this.formSubmitted;
  }
  validateMeetingEditTitle(): boolean {
    const meetingTitleControl = this.editMeetingForm.get('meetingTitle');
    return meetingTitleControl.invalid && (meetingTitleControl.dirty || meetingTitleControl.touched);
  }
  validateEditUploadDocument(): boolean {
    const meetingTitleControl = this.editMeetingForm.get('uploadDocument');
    return meetingTitleControl.invalid && (meetingTitleControl.dirty || meetingTitleControl.touched);
  }
  validateEditPackNames(): boolean {
    const meetingTitleControl = this.editMeetingForm.get('packName');
    return meetingTitleControl.invalid;;
  }
  validateEditTimeFrom(): boolean {
    const meetingTitleControl = this.editMeetingForm?.get('timeFrom');
    return meetingTitleControl.invalid && (meetingTitleControl.dirty || meetingTitleControl.touched);
  }

  validateEditTimeTo(): boolean {
    const meetingTitleControl = this.editMeetingForm?.get('timeTo');
    return meetingTitleControl.invalid && (meetingTitleControl.dirty || meetingTitleControl.touched);
  }
  validateTimeRangeEdit() {
    const timeFromControl = this.editMeetingForm?.get('timeFrom');
    const timeToControl = this.editMeetingForm?.get('timeTo');

    if (timeFromControl && timeToControl) {
      const timeFrom = timeFromControl.value;
      const timeTo = timeToControl.value;

      const timeFromDate = new Date('2000-01-01 ' + timeFrom);
      const timeToDate = new Date('2000-01-01 ' + timeTo);

      return timeToDate > timeFromDate;
    }

    return false;
  }

  validateEditDate(): boolean {
    const meetingTitleControl = this.editMeetingForm.get('date');
    return meetingTitleControl.invalid && (meetingTitleControl.dirty || meetingTitleControl.touched);
  }
  validateMeetingTitle(): boolean {
    return this.setMeetingForm.get('meetingTitle').invalid
  }

  validatePackNames(): boolean {
    return this.setMeetingForm.get('packName').invalid
  }

  validateDate(): boolean {
    return this.setMeetingForm.get('date').invalid
  }

  validateUploadDocument(): boolean {
    return this.setMeetingForm.get('uploadDocument').invalid;
  }

  validateTimeFrom(): boolean {
    const control = this.setMeetingForm?.get('timeFrom');
    return control ? control.hasError('required') : false;
  }

  validateTimeTo(): boolean {
    const control = this.setMeetingForm?.get('timeTo');
    return control ? control.hasError('required') : false;
  }

  validateTimeRange() {
    const timeFromControl = this.setMeetingForm?.get('timeFrom');
    const timeToControl = this.setMeetingForm?.get('timeTo');

    if (timeFromControl && timeToControl) {
      const timeFrom = timeFromControl.value;
      const timeTo = timeToControl.value;

      const timeFromDate = new Date('2000-01-01 ' + timeFrom);
      const timeToDate = new Date('2000-01-01 ' + timeTo);

      return timeToDate > timeFromDate;
    }

    return false;
  }

  onSearchChange(searchValue: string): void {
    if (searchValue.length > 2) {
      this.isCommonLoading = true;
      this.isLogsLoading = true;
      this.apiService.searchMeetingAttendee(searchValue).subscribe((res: any) => {
        if (res && res['data']) {
          this.isLogsLoading = false;
          this.isCommonLoading = false;
          this.searchResults = res['data'].filter((item: any) =>
            !this.selectedItems.some((selectedItem: any) => selectedItem.email === item.email)
          );
        } else {
          this.searchResults = [];
        }
      });
    } else {
      this.searchResults = [];
    }
  }

  addEmailToSelectedItems(email: any, reqType: string = null): void {
    let newItem: any;
    if (reqType == 'edit') {
      if (email.attendeesEmail && this.isValidEmail(email.attendeesEmail)) {
        newItem = {
          displayName: email.attendeesName,
          email: email.attendeesEmail,
          id: -1,
          userName: '',
        };

        if (!this.selectedItems.some((selectedItem: any) => selectedItem.email === email.attendeesEmail)) {
          this.selectedItems.push(newItem);
        }
      }
    } else {
      if (email && this.isValidEmail(email)) {
        newItem = {
          displayName: email,
          email: email,
          id: -1,
          userName: '',
        };

        if (!this.selectedItems.some((selectedItem: any) => selectedItem.email === email)) {
          this.selectedItems.push(newItem);
        }
      }


      this.getPickNameValidators(SubActionEnum[SubActionEnum.edit])
      this.pickName = '';
    }
  }

  patchEmailToSelectedItems(email: any, reqType: string = null): void {
    let newItem: any;
    if (reqType == SubActionEnum[SubActionEnum.edit]) {
        newItem = {
          displayName: email.attendeesName,
          email: email.attendeesEmail,
          id: -1,
          userName: '',
        };

        if (!this.selectedItems.some((selectedItem: any) => selectedItem.email === email.attendeesEmail)) {
          this.selectedItems.push(newItem);
      }
    } else {
      if (email && this.isValidEmail(email)) {
        newItem = {
          displayName: email,
          email: email,
          id: -1,
          userName: '',
        };

        if (!this.selectedItems.some((selectedItem: any) => selectedItem.email === email)) {
          this.selectedItems.push(newItem);
        }
      }
    }
  }

  isValidEmail(email: string): boolean {
    const allowedEmailPatterns = [
      /^[A-Za-z0-9._%+-]+@randmutual\.co\.za$/,
      /^[A-Za-z0-9._%+-]+@gmail\.com$/
    ];

    for (const pattern of allowedEmailPatterns) {
      if (pattern.test(email)) {
        return true;
      }
    }

    return false;
  }


  addSelectedItem(item: any): void {
    if (!this.selectedItems.includes(item)) {
      this.selectedItems.push(item);
      this.pickName = '';
      this.getPickNameValidators(
        (this.currentMeetingAction != null && this.currentMeetingAction == SubActionEnum[SubActionEnum.edit]) ? SubActionEnum[SubActionEnum.edit] : null)
      this.searchResults = [];
    }
  }

  removeSelectedItem(item: any): void {
    const index = this.selectedItems.indexOf(item);
    if (index !== -1) {
      this.selectedItems.splice(index, 1);
    }
    this.getPickNameValidators()
  }

  getTribunalMeetingDetails(endPoint: number): void {
    this.meetingType = endPoint;
    this.isInfoLoading = true;
    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }
    this.isCommonLoading = true;
    this.apiService.getTribunalMeeting(SubActionEnum[this.meetingType], this.apiParams, this.data.details.objectionId).subscribe((res: any) => {
      if (res && res['data'] || this.meetingType) {
        this.tribunalMeetings = res['data']

        this.dataSource = new MatTableDataSource(res['data']);
        this.isCommonLoading = false;
        this.totalItems = res.rowCount;
        this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
        this.isInfoLoading = false;
      }
    })
  }
  handlePageinatorEventScheduledMeeting(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getTribunalMeetingDetails(this.meetingType)

  }
  handlePageinatorEventCompletedMeeting(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getTribunalMeetingDetails(this.meetingType)

  }

  onConfirmAction(acton: string): void {
    this.dialogRef.close({ status: 'confirm', action: acton })
  }
  onFileSelect1(input: HTMLInputElement): void {
    let tempByte: number = 0, unit: string = '';
    function formatBytes(bytes: number): string {
      const UNITS = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const factor = 1024;
      let index = 0;
      while (bytes >= factor) {
        bytes /= factor;
        index++;
      }
      tempByte = bytes;
      unit = `${UNITS[index]}`
      return `${parseFloat(bytes.toFixed(2))} ${UNITS[index]}`;
    }
    const file = input.files[0];
    this.fileInfo1 = { fileName: file.name, fileSize: formatBytes(file.size), size: tempByte, unit: unit }
  }
  removeEmail(data: any): void {
    const indexInSendTo = this.emailList.findIndex(item => item.value === data.value);
    const indexInSendToCc = this.emailListCC.findIndex(item => item.value === data.value);

    if (indexInSendTo >= 0) {
      this.emailList.splice(indexInSendTo, 1);
      this.updateValidationState('sendTo');
      this.isDuplicateEmail = false;

    } else if (indexInSendToCc >= 0) {
      this.emailListCC.splice(indexInSendToCc, 1);
      this.updateValidationState('sendToCc');
      this.isDuplicateEmail = false;

    }
  }
  updateValidationState(controlName: string): void {
    const control = this.sendEmailForm.get(controlName);

    const hasInvalidEmail = this.emailList.some(item => item.invalid);
    const hasInvalidEmailCc = this.emailListCC.some(item => item.invalid);

    const isFieldEmpty = !this.emailList.length && controlName === 'sendTo';
    const isFieldEmptyCc = !this.emailListCC.length && controlName === 'sendToCc';

    if (control) {
      if (controlName === 'sendTo') {
        this.isDuplicateEmail = hasInvalidEmail && !isFieldEmpty;
      } else if (controlName === 'sendToCc') {
        this.isDuplicateEmailCc = hasInvalidEmailCc && !isFieldEmptyCc;
      }

      if (!hasInvalidEmail && isFieldEmpty && control.hasError('duplicateEmail')) {
        const areAllEmailsValid = controlName === 'sendTo' ? !this.emailList.some(item => !item.invalid) : true;

        if (areAllEmailsValid) {
          control.setErrors(null);
        }
      } else {
        if (hasInvalidEmail || hasInvalidEmailCc) {
          control.setErrors({ incorrectEmail: true });
        } else {
          control.setErrors(null);
        }
      }
    }
  }

  isEmptyOrSpaces(str: string | null | undefined): boolean {
    return str === null || str === undefined || str.match(/^ *$/) !== null;
  }
  addTab(event): void {
    if (event.value) {
      const trimmedValue = event.value.trim();
      if (trimmedValue) {
        if (this.validateEmail(trimmedValue)) {
          const isDuplicate = this.emailList.some(item => item.value === trimmedValue);
          if (isDuplicate) {
            this.isDuplicateEmail = true;
            this.sendEmailForm.controls['sendTo'].setErrors({ 'duplicateEmail': true });
          } else {
            this.isDuplicateEmail = false;
            this.emailList.push({ value: trimmedValue, invalid: false });
            this.sendEmailForm.controls['sendTo'].setErrors(null);
          }
        } else {
          this.emailList.push({ value: trimmedValue, invalid: true });
          this.sendEmailForm.controls['sendTo'].setErrors({ 'incorrectEmail': true });
        }
      } else {
        this.sendEmailForm.controls['sendTo'].setErrors(null);
      }
    }
    if (event.input) {
      event.input.value = '';
    }
  }

  get duplicateEmailError(): boolean {
    return this.isDuplicateEmail;
  }
  addTabCC(event): void {
    if (event.value) {
      if (this.validateEmail(event.value)) {
        const isDuplicate = this.emailListCC.some(item => item.value === event.value);
        if (isDuplicate) {
          this.isDuplicateEmailCc = true;
          this.sendEmailForm.controls['sendToCc'].setErrors({ 'duplicateEmail': true });
        } else {
          this.isDuplicateEmailCc = false;
          this.emailListCC.push({ value: event.value, invalid: false });
          if (this.sendEmailForm.controls['sendToCc'].hasError('duplicateEmail')) {
            this.sendEmailForm.controls['sendToCc'].setErrors(null);
          }
        }
      } else {
        this.emailListCC.push({ value: event.value, invalid: true });
        this.sendEmailForm.controls['sendToCc'].setErrors({ 'incorrectEmail': true });
      }
    }
    if (event.input) {
      event.input.value = '';
    }
  }

  onSendEmail(emailPayload: sendEmailDetails): void {
    const payLoadEmail = {
      FinPayeeId: "2",
      MailSubject: this.sendEmailForm.value.subject,
      ToIds: emailPayload.sendTo.join(','),
      ToCc: emailPayload.sendToCC.join(','),
      Type: "Schedule",
      MailText: this.sendEmailForm.value.emailBody,
      Status: "Submitted",
      Attachments: this.fileInfo1.fileName ? [{
        FileName: this.fileInfo1.fileName ? this.fileInfo1.fileName : '',
        AttachmentByteData: "",
        FileType: ".pdf",
        SkipSaveAttachment: false
      }] : undefined

    }

    this.debtorApiService.postEmailData(payLoadEmail).subscribe((res: any) => {
      if (res && res.data == "1") {
        this.isSpinner = false;
        this.dialogRef.close();
        this.toastr.successToastr('Email has sent successfully');
        this.dialogRef.close({ key: 'status_updated' });
      } else {
        this.toastr.errorToastr('Error while sending an email');
        this.isSpinner = false;
      }
    })
  }

  sendEmail(): void {
    this.formSubmitted = true;


    if (this.sendEmailForm.status == 'VALID') {

      let sendToEmailList: any = [], sendToCCEmailList: any = [];
      let sendEmailDetails: sendEmailDetails;
      sendToEmailList = this.emailList.map((val: any) => val.value)
      sendToCCEmailList = this.emailListCC.map((val: any) => val.value)
      sendEmailDetails = { sendTo: sendToEmailList, sendToCC: sendToCCEmailList }

      let attachments = {
        FileName: '',
        AttachmentByteData: '',
        FileType: '',
        SkipSaveAttachment: ''
      }

      const payload = {
        ItemType: "11",
        ItemId: "2",
        Subject: this.sendEmailForm.value.subject,
        FromAddress: "collections1@randmutual.co.za",
        Recipients: sendEmailDetails.sendTo.join(','),
        RecipientsCC: sendEmailDetails.sendToCC.join(','),
        RecipientsBCC: "mmistry@randmutual.co.za",
        Body: this.sendEmailForm.value.emailBody,
        IsHtml: false,
        isSuccess: true,
        ModifiedBy: "Spathan@randmutual.co.za",
        Attachments: this.fileInfo1.fileName ? [{
          FileName: this.fileInfo1.fileName ? this.fileInfo1.fileName : '',
          AttachmentByteData: this.base64Output,
          FileType: ".pdf",
          SkipSaveAttachment: false
        }] : undefined
      }

      this.isSpinner = true;
      this.debtorApiService.postEmailData2(payload).subscribe((res: any) => {
        if (res && res == 200) {
          this.dialogRef.close({ status: 'email_send' });
          this.toastr.successToastr('Email has sent successfully');
        } else {
          this.toastr.errorToastr('Error while sending an email');
          this.isSpinner = false;
        }
      })
    }
  }


  getDepartmentList(text: string): void {
    this.deptList = [];
    this.apiService.getAssessmentDepartmentList(text).subscribe((res) => {
      if (res && res.data) {
        this.deptList = res.data;
      }
    })
  }

  getDepartmentUserList(id): void {
    this.TransferToList = [];
    this.apiService.getAssessmentDepartmentUserList(id).subscribe((res) => {
      if (res && res.data) {
        this.TransferToList = res.data;
      }
    })
  }

  updateAttendiesAttendance(AttendanceStatus: boolean, id: number, index: number): void {

    this.isSpinner = true;
    this.apiService.updateMeetingAttendance(AttendanceStatus, id.toString()).subscribe((res: any) => {
      if (res && res.data && res.data == '1') {
        this.isSpinner = false;
        this.patchAttendiesClaimFormActions(AttendanceStatus, index)
        this.toastr.successToastr('Attendee details have been Updated Successfully', '', true);
      } else {
        this.isSpinner = false;
        this.toastr.errorToastr('Error while Updated Attendance', '', true);
      }
    })
  }

  patchAttendiesClaimFormActions(status: boolean, index: number): void {
    this.attendyMeetingJoinOptions.map((t: any) => {
      if (status) {
        this.attendyMeetingJoinOptions[index].isAttended = true;
      } else {
        this.attendyMeetingJoinOptions[index].isAttended = false;
      }
    })

  }

  onPdfFileSelect(event: Event) {
    this.isSpinner = true;
    const input = event.target as HTMLInputElement;
    const file = input.files[0];
    this.selectedFileName = file.name;
    this.onFileSelect1(input)


    if (this.fileInfo1.unit == 'Bytes' || this.fileInfo1.unit == 'kB' || (this.fileInfo1.unit == 'MB' && this.fileInfo1.size <= 2)) {
      this.isFileSizeExceeds = false;
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const pdfData = new Uint8Array(e.target.result as ArrayBuffer);
          const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
          const pdfUrlWithParams = URL.createObjectURL(pdfBlob) + '#toolbar=0&navpanes=0';
          this.pdfData = pdfData
          const pdfViewer = document.getElementById('pdfViewer') as HTMLIFrameElement;
          pdfViewer.src = pdfUrlWithParams;
          this.fileSource = pdfUrlWithParams;
        };
        reader.readAsArrayBuffer(file);
        this.isSpinner = false;
      }
    } else {
      this.isFileSizeExceeds = true;
    }
  }


  onFileSelected(event: Event, details: any, index: number, docTypeName: string) {
    this.onFileSelect(event)
    const input = event.target as HTMLInputElement;
    const file = input.files[0];
    if (file) {
      this.fileType = file.type;
      this.fileSize = file.size;
      this.convertFile(file).subscribe(base64 => {
        this.base64Output = `data:application/pdf;base64,${base64}`;

        if (docTypeName == 'claimForm') {
          this.uploadClaimForm(file.name, details, index, docTypeName);
        } else {
          this.docFileDetails = {
            fileName: file.name,
            details: details,
            index: index,
            docTypeName: docTypeName
          };
          this.selectedDocumentName = this.docFileDetails.fileName;
        }

        this.checkFileType();
        this.checkFileSize();
      });
    }
  }

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  uploadClaimForm(fileName: string, attendyDetails: any, index: number, doctypeName: string): void {
    const timeStamp = format(new Date(), 'yyMMddHMs')
    const keysObject = { "MeetingAttendiesId": timeStamp };
    const request = {
      docTypeId: DocumentUploadEnum.DocTypeId,
      systemName: "ClaimForm",
      fileName: 'File',
      keys: keysObject,
      documentStatus: DocumentUploadEnum.DocumentStatus,
      documentStatusText: DocumentUploadEnum[DocumentUploadEnum.Received],
      fileExtension: "application/pdf",
      documentSet: DocumentUploadEnum.DocumentSet,
      documentDescription: this.docUploadName != null ? this.docUploadName : 'New',
      fileAsBase64: this.base64Output
    };
    this.isSpinner = true;
    this.apiService.addRecoveryClaimForm(request, attendyDetails.id).subscribe((res: any) => {
      if (res && res.id) {
        this.isSpinner = false;
        if (this.previousDocumentPackAction === 'gen_att_ins') {
          this.attInsId = res.id;
          this.onSelect(this.previousDocumentPackAction);
        } else {
          if (doctypeName == 'claimForm') {
            this.toastr.successToastr('Document has been uploaded successfully.', '', true);
            this.showDetails(this.meetingData)
            this.uploadedDocumentFiles[index] = res;
          } else {

            if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions]) {
              this.formSubmitted = false;
              this.documentPackCurrentAction = 'gen_att_ins'
              this.attorneyInsDocResp = res
              this.isAttorneyInsDocPack = false
              this.attorneyInstructionForm.controls['documentPack'].setValue(res.id.toString())

            }

          }
        }
      } else {
        this.toastr.errorToastr('Failed to upload document.', '', true);
        this.isSpinner = false;
      }
    })

  }

  deleteClaimForm(id: number): void {
    this.apiService.deleteClaimForm(id).subscribe((res: any) => {
      if (res && res.data == 1) {
        this.toastr.successToastr('Claim form has been deleted successfully', '', true);
        this.showDetails(this.meetingData);
        this.isSpinner = false;
      } else {
        this.toastr.errorToastr('Error in delete claim form', '', true);
      }
    })
  }

  uploadDocument(index: number, doctypeName: string, id: string): void {
    const timeStamp = format(new Date(), 'yyMMddHMs')
    const keysObject =
      this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions] ? { "RecoveryId": id } : { "ObjectionId": id }
    const request = {
      docTypeId: DocumentUploadEnum.DocTypeId,
      systemName: "ClaimForm",
      fileName: doctypeName,
      keys: keysObject,
      documentStatus: DocumentUploadEnum.DocumentStatus,
      documentStatusText: DocumentUploadEnum[DocumentUploadEnum.Received],
      fileExtension: "application/pdf",
      documentSet: DocumentUploadEnum.DocumentSet,
      documentDescription: this.docUploadName != null ? this.docUploadName : 'New',
      fileAsBase64: this.base64Output
    };
    this.isSpinner = true;
    let api = this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions] ? 'SaveUploadRecoveryDocumentLegalCare' : 'SaveUploadObjectionDocumentLegalCare';
    this.apiService.addRecoveryDocumentPack(request, `${api}/${id}`).subscribe((res: any) => {
      if (res && res.id) {
        if (this.previousDocumentPackAction === 'gen_att_ins') {
          this.attInsId = res.id;
          this.onSelect(this.previousDocumentPackAction);
        } else {
          if (doctypeName == 'claimForm') {
            this.toastr.successToastr('Document has been uploaded successfully.', '', true);
            this.showDetails(this.meetingData)
            this.uploadedDocumentFiles[index] = res;
            this.isSpinner = false;
          } else {
            if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions]) {
              const uploadedDocument = {
                documentName: res.fileName,
                createdDate: res.createdDate,
                uploadedBy: res.createdBy,
                documentId: res.id,
                id: id
              }
              this.uploadDocPackList.unshift(uploadedDocument);
              this.formSubmitted = false;
              this.attorneyInstructions = 'in_doc_pack';
              this.documentPackCurrentAction = 'create_document_pack'
              this.documentPackSubAction == 'cre_doc_pck';
              this.isNoDocumentAdded = false;
              this.toastr.successToastr('Document has been uploaded successfully.', '', true);
              this.attorneyInsDocResp = res
              this.isAttorneyInsDocPack = false
              this.attorneyInstructionForm.controls['documentPack'].setValue(this.documentPack.value.packName);
              this.docUploadName = null;
              this.isSpinner = false;
            } else {
              const uploadedDocument = {
                documentName: res.fileName,
                createdDate: res.createdDate,
                uploadedBy: res.createdBy,
                documentId: res.id,
                id: id,
              }
              this.docUploadName = null;
              this.uploadDocPackList.unshift(uploadedDocument);
              this.isSpinner = false;
              this.isNoDocumentAdded = false;
              this.toastr.successToastr('Document has been uploaded successfully.', '', true);
            }
          }
        }
      } else {
        this.toastr.errorToastr('Failed to upload document.', '', true);
        this.isSpinner = false;
      }
    })
  }

  uploadDocumentInNotes() {

    this.formSubmitted = true;
    this.isFileSizeExceeds = true;

    const timeStamp = format(new Date(), 'yyMMddHMs');
    const id = format(new Date(), 'HHmmss');
    const keysObject = { "CollectionNotesDocumentId": timeStamp };
    const request = {
      docTypeId: DocumentUploadEnum.DocTypeId,
      systemName: "ClaimForm",
      fileName: 'File',
      keys: keysObject,
      documentStatus: DocumentUploadEnum.DocumentStatus,
      documentStatusText: DocumentUploadEnum[DocumentUploadEnum.Received],
      fileExtension: "application/pdf",
      documentSet: DocumentUploadEnum.DocumentSet,
      documentDescription: this.docUploadName != null ? this.docUploadName : 'New',
      fileAsBase64: this.uploadCourtOrderDocument
    };
    this.isSpinner = true;
    this.apiService.uploadDocumentInCollectionNotes(Number(id),request).subscribe((res: any) => {
      if (res && res.id) {
        this.isSpinner = false;
        this.submitNotes(res.id)
      }
    })
  }

  downloadDocument(id: string) {
    this.isSpinner = true;
    this.documentManagementService.GetDocumentBinary(Number(id)).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
      if (result) {
        const byteCharacters = atob(result.fileAsBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const b: any = new Blob([byteArray], {
          type: 'application/pdf'
        });
        let fileName = result.fileName;
        saveAs(b, fileName);
        this.isSpinner = false;
      }
    });
  }

  deleteDocument(index: number, isDelete: boolean) {
    this.isLoading$.next(true);
    const document: GenericDocument = this.uploadedDocumentFiles[index]

    this.requiredDocumentsUploadedEmit.emit(false);
    document.documentStatus = isDelete ? DocumentStatusEnum.Deleted : document.documentStatus;

    document.documentSet = 9
    document['fileAsBase64'] = this.base64Output
    document['keys'] = ''
    document['verifiedBy'] = ''
    document['verifiedByDate'] = new Date()
    document['mimeType'] = ''



    this.documentManagementService.updateDocumentGeneric(document).subscribe((result) => {

      this.isLoading$.next(false);
    });
  }

  uploadDocumentForDocPack(key: string): void {
    this.uploadDoc();
  }

  uploadDoc() {
    if (!this.isInvalidDocType) {
      const payload = {
        ObjectionId: this.data.details.objectionId,
        DocumentId: 1,
        DocumentName: this.documentPack.value.document,
      }
      let api = this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions] ? 'AddLegalCareRecoveryDocument ' : 'AddLegalCareObjectionDocument';
      this.isSpinner = true;
      this.apiService.uploadLegalcareDocumentPack(api, payload).subscribe((res: any) => {
        if (res && res.data == 1) {
          this.selectedDocumentName = null;
          this.isNoDocumentAdded = false;
          if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions]) {
            this.documentPackCurrentAction = 'create_document_pack';
            this.documentPackSubAction = 'cre_doc_pck';
          } else {
            this.documentPackCurrentAction = 'cre_doc_pck'
          }
          this.uploadDocument(0, this.docUploadName, res.recordId)
          this.documentIdList.push(res.recordId)
        }
        else {
          this.isSpinner = false;
        }
      })
    }

  }

  onCreateDocumentPack(): void {
    this.formSubmitted = true;
    if (this.uploadDocPackList?.length > 0) {
      if (this.documentPack.get('packName').valid) {
        this.createDocPack(true);
      }
    } else if (this.uploadDocPackList?.length == 0) {
      if (this.documentPack.get('document').valid) {
        this.isNoDocumentAdded = false;
        this.createDocPack(false);
      } else {
        this.isNoDocumentAdded = true;
      }
    }


  }

  createDocPack(isDocExist: boolean): void {
    if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.DocumentPack]) {
      if (this.isTribunalDocPackAdded) {
        this.updateLegalCareTribunal();
      } else {
        this.submitDocPackDetails();
      }
    } else {
      if (this.isNewDocPack) {
        this.submitDocPackDetails();
      } else {
        this.updateDocumentPack();
      }
    }
  }

  submitDocPackDetails(): void {
    if (this.uploadDocPackList?.length > 0) {
      this.isNoDocumentAdded = false;

      const documentIdList = this.uploadDocPackList.map((item) => item.id)


      if (this.documentPack.valid) {

        const payloadRefferal = {
          PackName: this.documentPack.value.packName,
          DocumentIds: documentIdList.join(','),
          ReferralId: this.data.details.referralId,
          AttorneyId: 0,
          Note: ""
        }

        const payloadObjection = {
          PackName: this.documentPack.value.packName,
          DocumentIds: documentIdList.join(','),
          ObjectionId: this.data.details.objectionId,
          AttorneyId: 0,
          Note: ""
        }

        const fianlPayload = this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions] ? payloadRefferal : payloadObjection

        let api = this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions] ? 'AddLegalCareRecoveryDocumentPack' : 'AddLegalCareObjectionDocumentPack';

        this.isSpinner = true;
        this.apiService.createLegalCareDocumentPack(api, fianlPayload).subscribe((res: any) => {

          if (res && res.data == 1) {
            this.isSpinner = false;
            this.documentPackID = res.recordId
            this.uploadDocPackList = [];
            this.isAttorneyInsDocPack = false;
            if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions]) {
              this.attorneyInstructions = 'out_doc_pack'
              this.documentPackCurrentAction = 'gen_att_ins'
              this.attorneyInstructionForm.get('documentPack').setValue(this.attorneyInstructionForm.value.documentPack != undefined ? this.attorneyInstructionForm.value.documentPack : null)
              this.attorneyInstructionForm.get('attorney').setValue(this.attorneyInstructionForm.value.attorney != undefined ? this.attorneyInstructionForm.value.attorney : null)
              this.attorneyInstructionForm.get('addNotes').setValue(this.attorneyInstructionForm.value.addNotes != undefined ? this.attorneyInstructionForm.value.addNotes : null)
            }

            this.toastr.successToastr('Document Pack has been created successfully.', '', true);
            if (this.data.action != LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions]) {
              this.dialogRef.close({ status: DataResponseEnum.Success });
              this.uploadDocPackList = [];
            }
          } else {

            this.isSpinner = false;
            this.toastr.errorToastr('Failed to upload document.', '', true);
          }
        })

      }
    } else {
      this.isNoDocumentAdded = true;
    }
  }

  uploadSingleDocForDocPack(): void {
    this.formSubmitted = true
    if (this.documentPack.valid && !this.isInvalidDocType && !this.invalideFileSize) {

      this.uploadDocument(this.docFileDetails.index, this.docFileDetails.docTypeName, null);
    }

  }

  getDocumentPackList(id: string): void {
    this.apiParams = {
      page: this.page,
      pageSize: 100,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }
    this.isSpinner = true;
    this.apiService.getDocumentPackList(id, this.apiParams).subscribe((res: any) => {
      if (res && res.data) {
        this.uploadDocPackList = res.data;
        this.isSpinner = false;
        if (this.uploadDocPackList?.length > 0) {
          const maxValue = Math.max(...this.uploadDocPackList.map(v => v.id));
          const currentData = this.uploadDocPackList.find((item) => item.id == maxValue)
          this.isTribunalDocPackAdded = true;
          this.tribunalDocPackId = currentData?.documentPackId;
          this.documentPack.get('packName').setValue((currentData && currentData?.packName) ? currentData?.packName : null)
          this.getTribunalDocPack(currentData?.documentPackId);
        } else {
          this.isTribunalDocPackAdded = false;
        }
      }
    })
  }
  getTribunalDocPack(id: number): void {
    this.apiService.getLegalCareTribunalDocPack(id).subscribe((res: any) => {
      if (res && res.data?.length > 0) {
        this.getLegalCareAttourneyInstructionDocPackName(res.data[0]?.documentPackId)
      }
    })
  }

  deleteDocumentFromPack(id: number): void {
    this.isSpinner = true;
    this.apiService.deleteDocumentFromPack(id).subscribe((res: any) => {
      if (res && res.data == DataResponseEnum.Success) {
        this.isSpinner = false;
        this.toastr.successToastr('Document has been deleted successfully','',true)
        this.getDocumentPackList(this.data?.details?.objectionId.toString());
      } else {
        this.isSpinner = false;
        this.toastr.errorToastr('Failed to delete document.', '', true);
      }
    })
  }

  deleteRecoveryDocumentFromPack(id: number): void {
    this.isSpinner = true;
    this.apiService.deleteRecoveryDocumentFromPack(id).subscribe((res: any) => {
      if (res && res.data == DataResponseEnum.Success) {
        this.isSpinner = false;
        this.toastr.successToastr('Document has been deleted successfully', '', true)
        this.getLegalCareAttorneyInstructionDocPack(this.documentPackID)
      } else {
        this.isSpinner = false;
        this.toastr.errorToastr('Failed to delete document.', '', true);
      }
    })
  }

  openActionDialog(action: string, data: any, entity: string, subAction: number = null): void {

    this.dialog.open(ActionDialogComponent, {
      data: {
        action: action,
        data: data,
        entity: entity
      },
    }).afterClosed().subscribe((res: any) => {
      if (res && res.key == DataResponseEnum.Success) {
        this.isSpinner = true;
        if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInvoices]) {
          this.apiService.deleteAPIInvoice(data?.id).subscribe((res: any) => {
            if (res) {
              this.isSpinner = false;

              this.toastr.successToastr('Invoice has been deleted');
              this.getAttorneyInvoiceDetails()
            } else {
              this.toastr.errorToastr(res.message, '', true);
              this.isSpinner = false;
            }
          })
        }
        if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.RecoveredPayment]) {
          this.apiService.deleteAPIRecvPayment(data?.id).subscribe((res: any) => {
            if (res) {
              this.toastr.successToastr('Payment has been deleted');
              this.getRecoveredPayment(this.data.details.referralId.toString())
              this.isSpinner = false;
            } else {
              this.toastr.errorToastr(res.message, '', true);
              this.isSpinner = false;
            }
          })
        }
        if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.AttorneyInstructions]) {
          this.deleteRecoveryDocumentFromPack(data?.id);
        }
        if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.DocumentPack]) {
          this.deleteDocumentFromPack(data?.id);
        }
        if (this.data.action == LegalActionDialogEnum[LegalActionDialogEnum.SetMeeting]) {
          if (subAction == SubActionEnum.attachment) {
            this.deleteMeeting(data);
          } else if (subAction == SubActionEnum.delete) {
            this.deleteClaimForm(data?.id);
          }
        }

      }
    })
  }

  getInvoiceStatusText(status: number): string {
    if (Object.values(UploadInvoiceStatus).includes(status)) {
      return UploadInvoiceStatus[`${status}`];
    } else {
      return 'Unknown Status';
    }
  }

  goTo(action: string, docPackAction: string, isAtDocPack: boolean): void {
    this.data.action = action;
    this.isAttorneyInsDocPack = isAtDocPack;
    this.documentPackCurrentAction = docPackAction;

  }
  getjudgementCollectionStatus(item: number): string {
    switch (item) {
      case LegalCareJudgementDecisionStatusEnum.Dismissed:
        return LegalCareJudgementDecisionStatusEnum[`${item}`];
      case LegalCareJudgementDecisionStatusEnum.Upheld:
        return LegalCareJudgementDecisionStatusEnum[`${item}`];
      default:
        return '';
    }
  }

  getAttorneyList(modId: number, perId: number) {
    this.isLogsLoading = true
    this.apiService.getCollectionsAttorneyList().subscribe((res: any) => {
      if (res && res.data) {
        this.attornyList = res.data;
        this.isLogsLoading = false
      }
    })
  }

  getLegalCareAttourneyInstruction(id: number): void {
    this.isSpinner = true;
    this.apiService.getLegalcareAttorneyInstructions(id).subscribe((res: any) => {
      if (res && res.data[0]?.docPackId) {
        this.currentDocPackId = res.data[res.data?.length - 1]?.docPackId;
        this.documentPackID = this.currentDocPackId;
        this.attorneyInstructionForm.get('attorney').setValue(res.data[res.data?.length - 1]?.attorneyId)
        this.attorneyInstructionForm.get('addNotes').setValue(res.data[res.data?.length - 1]?.notes)
        this.isSpinner = false;
        this.getLegalCareAttourneyInstructionDocPackName(this.currentDocPackId)
      } else {
        this.isSpinner = false;
      }
    })
  }

  getLegalCareAttourneyInstructionDocPackName(id: number): void {
    this.apiService.getLegalCareAttourneyInstructionDocPackName(id).subscribe((res: any) => {
      if (res && res.data) {
        let docPack = res.data.find((item: any) => item);
        this.documentPackID = docPack?.id;
        this.attorneyInstructionForm.get('documentPack').setValue((docPack && docPack?.packName) ? docPack?.packName : null);
        this.documentPack.get('packName').setValue((docPack && docPack?.packName) ? docPack?.packName : null)
      }
    })
  }

  getLegalCareAttorneyInstructionDocPack(id: number): void {
    this.apiService.getLegalcareAttorneyInstructionsForDocPack(id).subscribe((res: any) => {
      if (res) {
        this.uploadDocPackList = res?.data
      }
    })
  }

  preventEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }
  handleTextareaEnter(event: KeyboardEvent): void {
    event.preventDefault();
  }
  onScheduleTimeInputChange(event: Event, controlName: string): void {
 
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    const isValidTime = /^\d{0,2}:\d{0,2}$/.test(inputValue) || /^\d+$/.test(inputValue);

    if (isValidTime) {
      this.setMeetingForm.get(controlName).setValue(inputValue, { emitEvent: false });

    } else {
      this.setMeetingForm.get(controlName).setValue('', { emitEvent: false });

    }
    if (controlName === 'timeFrom') {
      this.filteredTimesFrom = of(this.filterTimes(this.setMeetingForm.get('timeFrom').value || ''));

    } else if (controlName === 'timeTo') {
      this.filteredTimesTo = of(this.filterTimes(this.setMeetingForm.get('timeTo').value || ''));

    }
}
onEditTimeInputChange(event: Event, controlName: string): void {
  const inputElement = event.target as HTMLInputElement;
  const inputValue = inputElement.value;
  const isValidTime = /^\d{0,2}:\d{0,2}$/.test(inputValue) || /^\d+$/.test(inputValue);

  if (isValidTime) {
    this.editMeetingForm?.get(controlName)?.setValue(inputValue, { emitEvent: false });
  } else {
    this.editMeetingForm?.get(controlName)?.setValue('', { emitEvent: false });
  }

  if (controlName === 'timeFrom') {
    this.filteredTimesFrom = of(this.filterTimes(this.editMeetingForm?.get('timeFrom')?.value || ''));
  } else if (controlName === 'timeTo') {
    this.filteredTimesTo = of(this.filterTimes(this.editMeetingForm?.get('timeTo')?.value || ''));
  }
}
  onTimeDropdownOpened(controlName: string): void {
    if (controlName === 'timeFrom') {
      this.filteredTimesFrom = of(this.times);
    } else if (controlName === 'timeTo') {
      this.filteredTimesTo = of(this.times);
    }
  }

  onTimeDropdownClosed(controlName: string): void {
    if (controlName === 'timeFrom') {
      this.isDropdownOpenFrom = false;
    } else if (controlName === 'timeTo') {
      this.isDropdownOpenTo = false;
    }
  }

  filterTimes(value: string): string[] {
    const filterValue = value.replace(/\D/g, '');
    return this.times.filter(time => time.replace(/\D/g, '').includes(filterValue));
  }
  isToday(selectedDate: string): boolean {
    const today = new Date();
    const parsedDate = new Date(selectedDate);
    return (
      parsedDate.getDate() === today.getDate() &&
      parsedDate.getMonth() === today.getMonth() &&
      parsedDate.getFullYear() === today.getFullYear()
    );
  }


  clearInput(controlName: string) {
    this.setMeetingForm.get(controlName).setValue('');
  }
  applyFilterStaus(event: Event, controlName: string) {
    if (!controlName || controlName.trim() === '') {
      this.filteredStatusList = this.statusOptions.map(option => this.getStatusText(option as LegalCareUpdateStatusEnum));
      return;
    }
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredStatusList = Object.values(LegalCareUpdateStatusEnum)
      .filter(value => typeof value === 'number')
      .map(value => this.getStatusText(value as LegalCareUpdateStatusEnum))
      .filter(option => option.toLowerCase().includes(searchValue));
  }

  toggleAutocompletePanel(open: boolean): void {
    this.isInputClicked = open;
    if (open) {
      this.statusOptions = [LegalCareUpdateStatusEnum.Successful, LegalCareUpdateStatusEnum.Unsuccessful, LegalCareUpdateStatusEnum.Abandoned, LegalCareUpdateStatusEnum.NotAgreedtoRAF, LegalCareUpdateStatusEnum.Repudiated];
    }
  }

  onStatusDropdownClosed(): void {
    this.isInputClicked = false;
  }

  uploadSupprotingDocument(): void {
    const timeStamp = format(new Date(), 'yyMMddHMs')

  }

}


