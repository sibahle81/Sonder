import { Component, ElementRef, Inject, Input, OnInit, ViewChild, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DebtcareApiService } from '../../services/debtcare-api.service';
import { DebtCareService } from '../../services/debtcare.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MatChipInputEvent } from '@angular/material/chips';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FileUploadService } from '../../services/file-upload.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { format } from 'date-fns'
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ActionDialogComponent } from '../action-dialog/action-dialog.component';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { UploadDocument } from 'projects/clientcare/src/app/policy-manager/shared/entities/upload-documents';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { CategoryStatusEnum } from 'projects/shared-models-lib/src/lib/enums/status-category-enum';
import { DataService } from '../../services/data.service';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';
import * as saveAs from 'file-saver';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { HttpClient } from '@angular/common/http';
import { SubActionEnum } from 'projects/shared-models-lib/src/lib/enums/sub-action-enum';
import { FormStatusEnum } from 'projects/shared-models-lib/src/lib/enums/form-status-enum';
import { DebtcareActionDialogEnum } from 'projects/shared-models-lib/src/lib/enums/debtcare-action-dialog-enum';
import { payloadEmail } from '../../models/shared/interfaces/payload-email.interface';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { EncryptionUtility } from 'projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility';
interface smsConversation {
  smsText: string,
  smsDate: string,
}
interface paginationParams {
  page: number,
  pageSize: number,
  orderBy: string
  sortDirection: string,
  search: string
}
export interface InvoiceTableData {
  invoiceNumber: number;
  createdDate: string;
  totalInvoiceAmount: number;
  status: any;
  invoiceDate: string;
  dueByDay: number;
  invoiceId: number,
  AttachmentByte: string
}

interface uploadedFileList {
  FileName: string,
  AttachmentByteData: string,
  FileType: string,
}

interface sendEmailDetails {
  sendTo: string[],
  sendToCC: string[],
  sendToBcc: string[]
}

interface byteFormattedData{
  byte: number,
  data: string,
  unit: string
}
@Component({
  selector: 'app-debtor-common-dialog',
  templateUrl: './debtor-common-dialog.component.html',
  styleUrls: ['./debtor-common-dialog.component.css']
})
export class DebtorCommonDialogComponent extends UnSubscribe implements OnInit {
  @ViewChild('paginator') pageEvent: any;
  @ViewChild('registrationDocuments') registrationDocumentsUploadControlComponent: UploadControlComponent;
  @ViewChild('updateStatus', { static: false }) updateStatus: ElementRef<HTMLInputElement>;

  TransferToList: string[] = [];
  collectionStatus: string[] = []
  selectedCollectionStatus: string | undefined;
  base64File: any = null;
  filename: any = null;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  announcer = inject(LiveAnnouncer);
  invoicesAction: string = 'invoices_details';
  signDocumentsAction: string = 'invoices_details';
  enableProgreeBar: boolean = false;
  invoiceDetails: any = [];
  signDocsDetails: any = [];
  isSignDocsLoading: boolean = false;
  isInvoiceLoading: boolean = false;
  isMessageList: boolean = true;
  currentMessageType: string = 'list'
  username: string = "";
  testMessage: string = '';
  messageIsEmpty: boolean = false;
  selectedDepartment: any;
  SelectedTransferTo: any;
  selectedCollectionStatusId: any | undefined = undefined;
  statusList: any;
  isLoading: boolean = false;
  updateStatusForm: FormGroup;
  sendEmailForm: FormGroup;
  conversationList: any;
  coversationChat: any;
  openConversationMsg: any;
  isLogsLoading: boolean = false;
  date: Date;
  sendSMSForm: FormGroup;
  sendMessageConversation: smsConversation[] = [];
  isSpinner: boolean = false;
  loggedUser: any
  DepartmentList: any[] = [];
  isUpdateSpinner: boolean = false;
  trustedPDFUrl: any;
  systemname: any;
  selectedRecord: any = '101';
  inApprovalMode: boolean = false;
  public documentSet = DocumentSetEnum.AcceptedQuoteDocuments;
  formSendEmail: FormGroup;
  signDocPTPForm: FormGroup;
  selectedFileName: string | undefined = undefined;
  displayedColumns: string[] = ['invoiceNumber', 'createdDate', 'totalInvoiceAmount', 'invoiceDate', 'status', 'dueByDay', 'action'];
  dataSource: MatTableDataSource<InvoiceTableData> = new MatTableDataSource<InvoiceTableData>();
  pageSizeOptions: number[] = [5, 10, 20, 50, 55, 60, 70, 80];
  pageSize: number = 5;
  page: number = 1;
  totalItems: number = 0;
  hasMoreData: boolean = true;
  apiParams: paginationParams | undefined;
  inputValue: any = '';
  emailTags: string[] = [];
  input = document.querySelector('.toemail');
  email = this.inputValue.trim();
  span = document.querySelectorAll('.email-tag')
  isClassToAdd: boolean = false;
  isValidate: any;
  formSubmitted: boolean = false;
  public pdfSrc = "";
  public isPdfUploaded: boolean = false;
  signedBlob: any
  public totalPages: number = 0;
  isDocUploadEnabled: boolean = false;
  selectedDocumentSet: DocumentSetEnum;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger;
  pdfData?: any;
  signatureImage?: any;
  pageIndex1: number = 0;
  dateToday: Date = new Date();
  attachments: any | undefined = null;
  fileInfo: string | undefined;
  fileDetails: any | undefined = {};
  docFileInfo: string | undefined = null;
  imageFileInfo: string | undefined = null;
  fileType: any;
  fileSize: any;
  isInvalidDocType: boolean = false;
  invalideFileSize: boolean = false
  fileSource: SafeResourceUrl = null;
  keywords = new Set(['angular', 'how-to', 'tutorial']);
  public emailList = [];
  public emailListCC = [];
  public emailListBCC = [];
  removable: boolean = true;
  isSaveDocButtonEnabled: boolean = false;
  ptpFileName: string | undefined = '';
  ptpFileText: string | undefined = '';
  isSaveExitSpinner: boolean = false;
  isFileSizeExceeds: boolean = false
  myControl = new FormControl('');
  myControl1 = new FormControl('');
  myControl2 = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;
  filteredOptionsDepartment: Observable<string[]>;
  filteredOptionsTransferTo: Observable<string[]>;
  keyValueID: any | undefined;
  uploadSignDoc: boolean = false;
  isUploading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @ViewChild('uploadDocuments', { static: false }) uploadControlComponent: UploadControlComponent;
  documentDescription = '';
  showDateTime: boolean = false;
  subAction = SubActionEnum;
  showUploadControl: boolean;
  selectedDocFile: any;
  docUploadName: string = null;
  isOpenConversation: boolean = false;
  isSMSTyped: boolean = false;
  originalData: any[] = [];
  searchFilter: any;
  signDocumentBase64: any = null;
  signatureContainer: boolean = false;
  textareaHeight: number = 48;
  popupHeight: number = 650;
  invalidTotalAttchments: boolean = false;
  attachedFileSize: number = 0;
  currentPopupHeight: number = this.popupHeight;
  isCommonSpinner: boolean = false;
  isCommonProgressBar: boolean = false;
  updateStatusHour: string = null;
  updateStatusMinute: string = null;
  isUpdateStatusDateRequired: boolean = false;
  isTimeSelectError: boolean = false;
  isUpdateStatus: boolean = false;
  collectionStatusName: string = null;
  isDialogDisabled: boolean = false;
  collectionStatusCodeID: number = null;
  statusCodeID: number = null;
  uploadedFileList: string[] = [];
  finalUploadedFile: any = {};
  finalUploadedList: uploadedFileList[] = [];
  filteredStatusList: any[] = [];
  selectedStatusoption = [];
  isAutocompleteOpen = false;
  isDropdownOpen: boolean = false;
  collectionStatusCategoryId: number;
  collectionStatusCetegoryName: string;
  updateStatusNotesLength: number = 0; 
  hoursList: number[] = Array(24).fill(0).map((n, i) => {
    if (i <= 9) { return '0' + (n + i).toString() }
    else { return (n + i).toString() }
  });
  minuteList: number[] = Array(60).fill(0).map((n, i) => {
    if (i <= 9) { return '0' + (n + i).toString() }
    else { return (n + i).toString() }
  });

  constructor(
    public dialogRef: MatDialogRef<DebtorCommonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly documentManagementService: DocumentManagementService,
    private debtorApiService: DebtcareApiService,
    private debtCareService: DebtCareService,
    private toastr: ToastrManager,
    private fb: FormBuilder,
    private pdfGenerationService: FileUploadService,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private readonly policyService: PolicyService,
    private readonly dataService: DataService,
    private http: HttpClient
  ) {
    super();
  }

  ngOnInit(): void {
    this.loggedUser = JSON.parse(EncryptionUtility.decryptData(sessionStorage.getItem('auth-profile')));
    this.selectedStatusoption = [];
    if (this.data.action == 'Update Status') {
      this.isCommonSpinner = true;
      this.debtCareService.getStatusList('0').subscribe(res => {
        if (res && res.data) {
          this.statusList = res.data;
          this.selectedStatusoption = [...this.statusList]
          this.isCommonSpinner = false;
        } else {
          this.statusList = [];
          this.selectedStatusoption = [];
          this.isCommonSpinner = false;
        }
      })
      this.getUpdateStatusForm();
    }
    if (!this.data.details) {
      this.data.details = JSON.parse(localStorage.getItem('selectedItem'))
    }
    if (this.data.action == 'Invoices') {
      this.getInvoiceDetails(this.data.details.finpayeeId);
    }
    if (this.data.action == 'Send Email') {
      this.getSendEmailForm();
      this.sendEmailMatChip();
    }
    if (this.data.action == 'Sign Documents') {
      this.getSignDocumentDetails(this.data.details.finpayeeId,this.data.details.policyId, false)
      this.getSignDocForm();
    }
    if (this.data.action == 'Send SMS') {
      this.getSendSMSForm();
      if (this.data.details) {
        this.getDebtCareConversations(this.data.details.finpayeeId,this.data.details.policyId);
      } else {
        this.getDebtCareConversations(0,0);
      }
    }
  }

  getSendEmailForm(): void {
    this.sendEmailForm = this.fb.group({
      sendTo: [[this.data?.details?.emailAddress], [Validators.required, Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$')]],
      sendToCc: [null, [Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$')]],
      sendToBcc: [null, [Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$')]],
      subject: ['', [Validators.required]],
      emailBody: ['', [Validators.required]],
      attachment: [''],
      uploadDocument: ['']
    })
  }

  getUpdateStatusForm(): void {
    this.updateStatusForm = this.fb.group({
      collectionStatus: [null, Validators.required],
      department: [''],
      transferTo: [''],
      dateAndTime: ['', Validators.required],
      timeHours: [''],
      timeMinutes: [''],
      updateStatusTime: ['', Validators.required],
      addNotes: [null, [Validators.required,Validators.maxLength(8000)]]
    })

    this.getFiltedOptionCollectionStatus();
    this.getDepartments('0');
    if (this.data.statusInfo != undefined && this.data.statusInfo?.length > 0) {

      this.isUpdateStatus = true;
      this.isLoading = true;
      this.getDepartments('0');
      this.isLoading = false;
      this.isUpdateStatusDateRequired = false;
      this.getDateTimePatched();

    } else {
      this.getDateTimePatched();
    }
  }

  getDateTimePatched(): void{
    this.isUpdateStatus = false;
      let currentTimeHrs = format(new Date(), 'HH')
      let currentTimeMin = format(new Date(), 'mm')
      this.updateStatusHour = currentTimeHrs;
      this.updateStatusMinute = currentTimeMin;
      this.updateStatusForm.get('timeHours').setValue(currentTimeHrs)
      this.updateStatusForm.get('timeMinutes').setValue(currentTimeMin)
      this.getTimeValue();
  }

  getSendSMSForm(): void {
    this.sendSMSForm = this.fb.group({
      contactNumber: ['', Validators.required],
      message: ['', [Validators.required,Validators.maxLength(1200)]]
    })
  }

  emailValidators(): { [key: string]: AbstractControl } {
    return this.sendEmailForm.controls;
  }

  sendEmailMatChip(): void {
    this.formSendEmail = this.fb.group({
      sendToInfo: ['', [Validators.required]]
    })
  }

  getSignDocumentDetails(id: number, policyId: number, isAfterFileSelect: boolean): void {
    this.isSignDocsLoading = true;
    let data: any;
    this.debtorApiService.getSignDocs(id,policyId).subscribe((res: any) => {
      if (res && res['data']) {
        this.signDocsDetails = res['data'];
        this.isSignDocsLoading = false;
        data = this.signDocsDetails[this.signDocsDetails.length - 1]
        this.keyValueID = data?.id;
      } else {
        this.isSignDocsLoading = false;
      }
    })
  }

  getInvoiceDetails(id: string) {
    this.isInvoiceLoading = true;
    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }
    this.debtorApiService.getInvoiceData(this.data.details.finpayeeId, this.apiParams).subscribe((res: any) => {
      if (res && res['data'] != undefined) {
        this.dataSource = new MatTableDataSource(res['data']);
        this.totalItems = res.rowCount;
        this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
        this.invoiceDetails = res['data']
        this.isInvoiceLoading = false;
      }
    })

  }

  handlePageinatorEventInvoice(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getInvoiceDetails(this.data.details.finpayeeId)
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (!this.originalData.length) {
      this.originalData = this.dataSource.data;
    }

    if (filterValue.length >= 2) {
      this.isSpinner = true;
      const params = {
        page: this.page,
        pageSize: this.pageSize,
        orderBy: "StartDateAndTime",
        sortDirection: "asc",
        search: filterValue || "0",
      };
      this.debtorApiService.getInvoiceData(this.data.details.finpayeeId, params).subscribe((res: any) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.searchFilter = res.data;
          this.dataSource = new MatTableDataSource(this.searchFilter);
          if (this.paginator) {
            this.paginator.length = res.rowCount;
            this.paginator.pageIndex = this.page - 1;
            this.paginator.pageSize = this.pageSize;
          }
        } else {
          this.isSpinner = false;
          this.dataSource = new MatTableDataSource([]);
        }
      },
        (error) => {
          this.isSpinner = false;
        }
      );
    } else {
      this.isSpinner = true;
      const params = {
        page: this.page,
        pageSize: this.pageSize,
        orderBy: "StartDateAndTime",
        sortDirection: "asc",
        search: "0",
      };
      this.debtorApiService.getInvoiceData(this.data.details.finpayeeId, params).subscribe((res: any) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.searchFilter = res.data;
          this.dataSource = new MatTableDataSource(this.searchFilter);
          if (this.paginator) {
            this.paginator.length = res.rowCount;
            this.paginator.pageIndex = this.page - 1;
            this.paginator.pageSize = this.pageSize;
          }
        } else {
          this.dataSource = new MatTableDataSource([]);
          if (this.paginator) {
            this.paginator.length = 0;
          }
        }
      },
        (error) => {
          this.isSpinner = false;
        });
    }
  }

  onSelectTransferTo(e: any): void {
    this.SelectedTransferTo = e
  }

  onFileSelect(e: any) {
    try {
      const file = e.target.files[0];
      const fReader = new FileReader()
      fReader.readAsDataURL(file)
      fReader.onloadend = (_event: any) => {
        this.filename = file.name;
        this.base64File = _event.target.result.split(',')[1];
      }
    } catch (error) {
      this.filename = null;
      this.base64File = null;
    }
  }

  onSelectDept(item: any, e: any): void {
    let selectedDept = this.DepartmentList.find(d => d.departmentId == e);
    if (selectedDept) {
      this.TransferToList = [];
      this.debtCareService.getDepartmentEmployeeList('0', selectedDept.departmentId).subscribe((res: any) => {
        if (res && res.data) {
          this.TransferToList = res.data
        } else {
          this.toastr.errorToastr(res.message, '', true);
        }
      })

    }

  }

  onSelectDepartment(departmentId: any): void {
    this.TransferToList = [];
    this.debtCareService.getDepartmentEmployeeList('0', departmentId).subscribe((res: any) => {
      if (res && res.data) {
        this.TransferToList = res.data;
      } else {
        this.toastr.errorToastr(res.message, '', true);
      }
    })
  }

  getDepartments(id: string): void {
    this.isSignDocsLoading = true;
    this.DepartmentList = [];
    this.debtCareService.getDepartmentList(id).subscribe((res: any) => {
      if (res && res['data']) {
        this.DepartmentList = res['data'];
        this.getFiltedOptionDepartment();
        this.isSignDocsLoading = false;
      }
    })
  }

  closeDialog(): void {
    this.dialogRef.close({ key: DebtcareActionDialogEnum[DebtcareActionDialogEnum.UpdateStatus] });
  }

  onSendEmail(emailPayload: sendEmailDetails): void {
    const payLoadEmail = {
      FinPayeeId: this.data.details.finpayeeId,
      MailSubject: this.sendEmailForm.value.subject,
      ToIds: emailPayload?.sendTo.join(',').toLowerCase(),
      ToCc: emailPayload?.sendToCC.join(',').toLowerCase(),
      Type: "Schedule",
      MailText: this.sendEmailForm.value.emailBody,
      Status: "Submitted",
      Attachments: this.fileDetails.fileName ? [this.finalUploadedFile] : undefined  
    }
    this.debtorApiService.postEmailData(payLoadEmail).subscribe((res: any) => {
      if (res && res.data == DataResponseEnum.Success) {
        this.isSpinner = false;
        this.dialogRef.close();
        this.toastr.successToastr('Email has sent successfully');
        this.dialogRef.close({ key: DebtcareActionDialogEnum[DebtcareActionDialogEnum.UpdateStatus] });
      } else {
        this.toastr.errorToastr('Error while sending an email');
        this.isSpinner = false;
      }
    })
  }

  sendEmail(ItemTypeId: number): void {
    this.formSubmitted = true;
    let formStatusCheck = (FormStatusEnum[FormStatusEnum.Valid]).toUpperCase();
    if (this.sendEmailForm.status == formStatusCheck && !this.isInvalidDocType) {
      let sendToEmailList: string[] = [], sendToCCEmailList: string[] = [], sendToBCCEmailList: string[] = [];
      let sendEmailDetails: sendEmailDetails;
      sendToEmailList = this.emailList.map((val: any) => val.value)
      sendToCCEmailList = this.emailListCC.map((val: any) => val.value)
      sendToBCCEmailList = this.emailListBCC.map((val: any) => val.value)
      sendEmailDetails = { sendTo: sendToEmailList, sendToCC: sendToCCEmailList, sendToBcc: sendToBCCEmailList }

      const payload: payloadEmail = {
        Subject: `From: ${this.loggedUser?.name}, Member Number: ${this.data?.details?.customerNumber}, ${this.sendEmailForm.value.subject}`,
        Recipients: (sendToEmailList.length > 0) ? sendEmailDetails?.sendTo.join(',').toLowerCase() : this.sendEmailForm.value.sendTo.join(',').toLowerCase(),
        RecipientsCC: sendEmailDetails?.sendToCC.join(',').toLowerCase(),
        RecipientsBCC: sendEmailDetails?.sendToBcc.join(',').toLowerCase(),
        Body: this.sendEmailForm.value.emailBody,
        IsHtml: true,
        ItemType : "DebtCare",
        ItemId : ItemTypeId,
        Attachments: this.fileDetails.fileName ? [...this.finalUploadedList] : undefined
      }

      this.isSpinner = true;
      this.debtorApiService.postEmailDebtcare(payload).subscribe((res: any) => {
        if (res && res.data == DataResponseEnum.Success) {
          this.isSpinner = false;
          this.finalUploadedList = [];
          this.toastr.successToastr('Email has sent successfully');
          this.dialogRef.close({ key: DataResponseEnum.Success, email: payload });
        } else {
          this.toastr.errorToastr('Error while sending an email');
          this.isSpinner = false;
        }
      })
    }
  }

  onSendEmailDebtcare(): void{
    let formStatusCheck = (FormStatusEnum[FormStatusEnum.Valid]).toUpperCase();
    if (this.sendEmailForm.status == formStatusCheck && !this.isInvalidDocType) {
      let sendToEmailList: string[] = [], sendToCCEmailList: string[] = [], sendToBCCEmailList: string[] = [];
      let sendEmailDetails: sendEmailDetails;
      sendToEmailList = this.emailList.map((val: any) => val.value)
      sendToCCEmailList = this.emailListCC.map((val: any) => val.value)
      sendToBCCEmailList = this.emailListBCC.map((val: any) => val.value)
      sendEmailDetails = { sendTo: sendToEmailList, sendToCC: sendToCCEmailList, sendToBcc: sendToBCCEmailList }
      this.isSpinner = true;      
      const LogTitlenext="<br>"; 
      let recipientsCC = sendEmailDetails?.sendToCC.join(',').toLowerCase()
      let recipientsBCC = sendEmailDetails?.sendToBcc.join(',').toLowerCase()
      let emailTo =  (sendToEmailList.length > 0) ? sendEmailDetails?.sendTo.join(',').toLowerCase() : this.sendEmailForm.value.sendTo.join(',').toLowerCase()
      const payloadData = {
       FinPayeeId: this.data?.details?.finpayeeId,
       PolicyId: this.data?.details?.policyId,
       LogTitle: (`Email Sent - (Subject: From: ${this.loggedUser?.name}, Member Number: ${this.data?.details?.customerNumber}, ${this.sendEmailForm.value.subject})\n\nTo: ${emailTo}\n`).toString()
       + (recipientsCC != null ? `CC: ${recipientsCC}\n`: ``).toString() 
       + (recipientsBCC != null ? `BCC: ${recipientsBCC}\n`: ``),
       Description: this.sendEmailForm.value.emailBody,
       AgentId: this.loggedUser.sub,
       AssignDate: (format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")).toString() + ".000Z",
       AssignTime: format(new Date(), "HH:mm"), 
       ActionType: DebtcareActionDialogEnum.Email
      }
        this.debtorApiService.addEmailActionLogs(payloadData).subscribe((res: any) => {
         if (res && res.data == DataResponseEnum.Success) {
          this.sendEmail(Number(res?.message))
         }
       })
    }
  }

  getDebtCareConversations(id: number, policyId: number) {
    this.isLogsLoading = true;
    this.debtorApiService.getDebtCareSMS(id,policyId).subscribe((res: any) => {
      this.isLogsLoading = false;
      if (res && res['data']) {
        this.conversationList = res['data'];
      }
    })
  }

  viewChat(conv: any) {
    this.openConversationMsg = conv
    let userData: any
    this.username = conv.clientNumber
    this.sendSMSForm.controls['contactNumber'].setValue(conv.clientNumber)
    if (this.data.details && this.data.details.finpayeeId) {
    } else {
      userData = JSON.parse(localStorage.getItem('debtCareSelectedItem'))
      this.data.details = JSON.parse(localStorage.getItem('debtCareSelectedItem'))
    }
    this.isSpinner = true;
    this.debtorApiService.getDebtCareSMSHistory(this.data.details.finpayeeId,this.data.details.policyId, conv.clientNumber).subscribe((res: any) => {
      this.currentMessageType = 'new_message'
      this.isOpenConversation = true;
      if (res && res['data']) {
        this.coversationChat = res['data'];
        this.date = this.coversationChat.createdDate;
        this.isSpinner = false;
      }
    })
  }

  sendSMS(): void {
    this.formSubmitted = true;
    this.sendMessageConversation = [];

    let smsDetails = {
      smsText: this.sendSMSForm.value.message,
      smsDate: format(new Date(), "eee LLL dd yyyy HH:mm:ss")
    }

    let smsLocalObj = {
      FinPayeeId: this.data.details.finpayeeId,
      PolicyId: this.data.details.policyId,
      ClientNumber: this.sendSMSForm.value.contactNumber,
      SmsText: this.sendSMSForm.value.message,
      Department: "debtors",
      UserName: this.loggedUser?.name,
      Campaign: "Debtors|mod"
    }
    if (this.sendSMSForm.valid) {
    this.isCommonSpinner = true;
      this.debtorApiService.sendMessageToLocalServer(smsLocalObj).subscribe((res: any) => {
        this.sendSMSForm.get('message').clearValidators();
        this.sendSMSForm.get('message').updateValueAndValidity();
        if (res && res?.data == DataResponseEnum.Success) {
          this.formSubmitted = false;
          this.isCommonSpinner = false;
          this.toastr.successToastr('Sms sent successfully.', '', true);
          this.sendMessageConversation.push(smsDetails)
          this.testMessage = null;
          this.sendSMSForm.get('message').setValue('')
        } else {
          this.isCommonSpinner = false;
          this.toastr.errorToastr('Somthing went wrong please try again', '', true);
        }
      })
    }
    else {
      this.isSpinner = false;
    }
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.updateStatusForm.get(controlName);
    return control.invalid && (control.dirty || this.formSubmitted);
  }

  onSelectHour(e: Event): void {
    this.updateStatusHour = e.toString();
    this.getTimeValue();
  }

  onSelectMinute(e: Event): void {
    this.updateStatusMinute = e.toString();
    this.getTimeValue();
  }

  getTimeValue(): void {
    const timeValue: string = this.updateStatusHour + ':' + this.updateStatusMinute;
    this.updateStatusForm.get('updateStatusTime').setValue(timeValue)
  }

  onSubmitUpdateStatus(): void {
    this.formSubmitted = true;

    if (this.isUpdateStatus) {
      this.submitUpdateStatus();
    } else {

      if (this.collectionStatusCodeID == CategoryStatusEnum.FollowUp) {
        if (this.updateStatusForm.get('dateAndTime').valid) {
          this.isUpdateStatusDateRequired = false;
          if ((this.updateStatusForm.get('timeHours').valid && this.updateStatusForm.get('timeMinutes').valid)) {
            this.isTimeSelectError = false;
            this.submitUpdateStatus();
          } else {
            this.isTimeSelectError = true;
          }
        } else {
          this.isUpdateStatusDateRequired = true;
        }
      } else {
        this.updateStatusForm.get('dateAndTime').setValue(new Date())
        this.getTimeValue();
        this.submitUpdateStatus();
      }
    }

  }

  onUpdateStatusDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (this.updateStatusForm.get('dateAndTime').valid) {
      this.isUpdateStatusDateRequired = false;
    } else {
      this.isUpdateStatusDateRequired = true;
    }
  }

  submitUpdateStatus(): void {
    if (this.updateStatusForm.valid || this.isUpdateStatus) {
      this.formSubmitted = false
      let formattedDate: string;
      if (this.updateStatusForm.value.dateAndTime && this.updateStatusForm.value.updateStatusTime) {
        formattedDate = this.formatDateTime(this.updateStatusForm.value.dateAndTime, this.updateStatusForm.value.updateStatusTime)
      }
      let nextActionDate: string;
      if (this.collectionStatusCategoryId != CategoryStatusEnum.FollowUp) {
        nextActionDate = (format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")).toString() + ".000Z"
      } else {
        if (formattedDate) {
          nextActionDate = (format(new Date(formattedDate), "yyyy-MM-dd'T'HH:mm:ss")).toString() + ".000Z"
        }
      }
      let statusObj = {
        FinPayeeId: this.data.details.finpayeeId,
        PolicyId: this.data.details.policyId,
        PtpCount: this.data.details.ptp == null ? 0 : this.data.details.ptp,
        NextActionDate: nextActionDate,
        CustomerNumber: this.data?.details?.customerName+'-'+this.data?.details?.customerNumber,
        Note: this.updateStatusForm.value.addNotes,
        TransferToDepartmentId: this.updateStatusForm.value.department != null ? this.updateStatusForm.value.department : 0,
        TransfertToUserId: this.updateStatusForm.value.transferTo != null ? this.updateStatusForm.value.transferTo : 0,
        DebtCollectionStatusCategoryId: this.collectionStatusCategoryId,
        DebtCollectionStatusCategoryName: this.collectionStatusCetegoryName
      }

      let finalPayload = {};
      if (this.data.statusInfo?.length > 0) {
        finalPayload = {
          CollectionStatusCodeId: this.collectionStatusCodeID != null ? this.collectionStatusCodeID
            : this.data.statusInfo[0]?.collectionStatusCodeId,
          id: this.data.statusInfo[0].id,
          CollectionStatusName: this.collectionStatusName != null ? this.collectionStatusName :
            this.data.statusInfo[0]?.collectionStatusName,
          ...statusObj
        }

        this.isCommonSpinner = true;
        this.debtCareService.updateStatus(finalPayload).subscribe((res: any) => {
          if (res && res.data == DataResponseEnum.Success) {

            this.toastr.successToastr('Status Updated successfully.', '', true);
            this.dialogRef.close({ key: DebtcareActionDialogEnum[DebtcareActionDialogEnum.UpdateStatus] });
            this.isCommonSpinner = false;
          } else {
            this.isCommonSpinner = false
            this.toastr.errorToastr(res.message, '', true);
          }
        })
      } else {
        finalPayload = {
          ...statusObj,
          CollectionStatusCodeId: this.selectedCollectionStatusId,
          CollectionStatusName: this.updateStatusForm.value.collectionStatus
        }

        this.isCommonSpinner = true;
        this.debtCareService.addStatus(finalPayload).subscribe((res: any) => {
          if (res && res.data == DataResponseEnum.Success) {
            this.toastr.successToastr('Status Updated successfully.', '', true);
            this.isCommonSpinner = true;
            this.dialogRef.close({ key: DebtcareActionDialogEnum[DebtcareActionDialogEnum.UpdateStatus] });
          } else {
            this.toastr.errorToastr(res.message, '', true);
            this.isCommonSpinner = true;
          }
        })
      }


    }
  }


  formatDateTime(date: any, time: string): string {
    let dateTempArr: any = [];
    let dateTempArr1: any = [];
    dateTempArr = new Date(date).toString().split('GMT');
    dateTempArr1 = dateTempArr[0].split(' ');
    let tempFormattedDate = dateTempArr1[0] + ' ' + dateTempArr1[1] + ' ' + dateTempArr1[2] + ' ' + dateTempArr1[3] + ' ' + time + ':00' + ' ' + 'GMT' + dateTempArr[1]
    return tempFormattedDate;
  }


  onSelectCollectionStatus(value: any, isUpdate: boolean): void {
    this.showDateTime = CategoryStatusEnum[value.debtCollectionStatusCategoryId] == CategoryStatusEnum[CategoryStatusEnum.FollowUp] ? true : false;
    this.collectionStatusCategoryId = value.debtCollectionStatusCategoryId;
    this.collectionStatusCetegoryName = CategoryStatusEnum[value.debtCollectionStatusCategoryId];
    this.updateStatusForm.get('department').setValue(value.transferToDepartmentId)
    if (value.debtCollectionStatusCodeId != CategoryStatusEnum.FollowUp) {
      this.onSelectDept(value, value.transferToDepartmentId)
    }
    if (!isUpdate) {
      this.updateStatusForm.get('transferTo').setValue(null);
      this.collectionStatusCodeID = value.debtCollectionStatusCodeId
      this.collectionStatusName = value.statusCategoryName
      this.statusCodeID = value.id
    } else {
      this.collectionStatusCodeID = this.data.statusInfo[0]?.collectionStatusCodeId
      this.collectionStatusName = this.data.statusInfo[0]?.collectionStatusName
      this.statusCodeID = this.data.statusInfo[0]?.id
    }
    let val: any = value;
    this.selectedCollectionStatus = val;
    this.selectedCollectionStatusId = val.debtCollectionStatusCodeId;
    if (this.data.statusInfo?.collectionStatusCodeId) {
      this.data.statusInfo.collectionStatusCodeId = this.selectedCollectionStatusId;
    }
    if (this.data.statusInfo?.collectionStatusName) {
      this.data.statusInfo.collectionStatusName = val.statusCategoryName;
    }
  }


  createBlobUrlWithParams(pdfData: Uint8Array) {
    const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(pdfBlob);
    return blobUrl + '#toolbar=0&navpanes=0';
  }

  onPdfFileSelect(event: Event, currentAction: number) {
    this.isSpinner = true;
    const input = event.target as HTMLInputElement;
    this.selectedDocFile = input.files[0]
    this.selectedFileName = this.selectedDocFile.name;
    this.onFileSelectInfo(event, currentAction)
  }

  uploadAndProceedSignDoc(): void {
    this.isFileSizeExceeds = false;
    this.signDocumentsAction = 'save_sign_doc'
    if (this.selectedDocFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.fileType = this.selectedDocFile.type
        this.fileSize = this.selectedDocFile.size
        this.checkFileType();
        this.checksignDocFileSize();
        const pdfData = new Uint8Array(e.target.result as ArrayBuffer);
        const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
        const pdfUrlWithParams = URL.createObjectURL(pdfBlob) + '#toolbar=0&navpanes=0';
        this.pdfData = pdfData
        this.fileSource = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrlWithParams);
        this.ptpFileText = this.signDocPTPForm.value.ptpFileName;
      };
      reader.readAsArrayBuffer(this.selectedDocFile);
      this.isSpinner = false;
    }
    this.isFileSizeExceeds = true;
  }

  checkFileType() {
    const allowedTypes = ['application/pdf']
    if (allowedTypes.includes(this.fileType)) {
      this.isInvalidDocType = false
    } else {
      this.isInvalidDocType = true
    }
  }

  checkFileTypeEmail(type: string) {
    const allowedTypes = ['pdf', 'xlsx', 'doc', 'docx', 'png','jpeg','jpg']
    if (type != null && allowedTypes.includes(type)) {
      this.isInvalidDocType = false
    } else {
      this.isInvalidDocType = true
    }
  }

  checkFileSize() {
    const currnetFileSize = (this.fileSize / 1048576);
    this.attachedFileSize = this.attachedFileSize + currnetFileSize; 
    const allowedFileSize = this.attachedFileSize <= 6.0
    if (allowedFileSize) {
      this.invalidTotalAttchments = false;
    } else {
      this.invalidTotalAttchments = true;
    }
  }

  generatePdfWithSignature() {
    this.getSendEmailForm();
    this.pdfGenerationService.generatePdfWithSignature(this.pdfData, this.signatureImage, this.page)
      .then(pdfBytes => this.downloadPdf(pdfBytes));
    this.isSaveDocButtonEnabled = true;
  }

  private downloadPdf(pdfBytes: Uint8Array) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      this.signDocumentBase64 = reader.result;
    }
    const url = window.URL.createObjectURL(blob);
    const pdfFile = new File([blob], `${this.ptpFileText}.pdf`);
    this.signedBlob = pdfFile;
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const pdfUrlWithParams = URL.createObjectURL(pdfBlob) + '#toolbar=0&navpanes=0';
    const pdfViewer = document.getElementById('pdfViewer') as HTMLIFrameElement;
    pdfViewer.src = pdfUrlWithParams;
    this.fileSource = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrlWithParams);
  }


  convertToBase64(url: string) {
    this.http.get(url, { responseType: "blob" }).subscribe(blob => {
      const reader = new FileReader();
      const binaryString = reader.readAsDataURL(blob);
      reader.onload = (event: any) => {
      };
      reader.onerror = (event: any) => {
      };
    });
  }

  attachPdfToFormControl(pdfBytes: Uint8Array) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfFile = new File([blob], 'signed-document.pdf');
  }

  onImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files[0];
    this.onFileSelect(event)
    this.imageFileInfo = `${file.name}`;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.signatureImage = e.target.result as string;
        this.generatePdfWithSignature();
      };
      reader.readAsDataURL(file);
    }
  }

  onFileSelectInfo(event: Event, action: number): void {
    let input = event.target as HTMLInputElement
    let unit: string = '';
    const file = input.files[0];
    this.fileType = file.type
    this.fileSize = file.size
    if (action == SubActionEnum.attachment) {
      let fileType: string = file.name?.split('.')[1]
      fileType = fileType ? fileType : null;
      this.checkFileTypeEmail(fileType);
      this.checkFileSize(); 
    } else {
      this.checkFileType();
      this.checksignDocFileSize();
    }
    
    this.fileDetails = { fileName: file.name, fileSize: this.formatBytes(file.size),size: file.size, unit: unit }
    if (action == SubActionEnum.attachment && !this.isInvalidDocType) {
      this.uploadedFileList.push(this.fileDetails);
    }
    if (!this.invalideFileSize || !this.invalidTotalAttchments) {
      this.pdfGenerationService.getBase64Format(file).subscribe((base64: any) => {
        if (base64 && SubActionEnum.attachment) {
          const fileObject = {
            FileName: file.name ? file.name : '',
            AttachmentByteData: base64,
            FileType: "application/pdf",
          }
          this.finalUploadedFile = fileObject;
          this.finalUploadedList.push(fileObject)
        }
      })
    }
  }

  formatBytes(bytes: number): byteFormattedData {
    let tempByte: number = 0, unit: string = '';
    const UNITS = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const factor = 1024;
    let index = 0;
    while (bytes >= factor) {
      bytes /= factor;
      index++;
    }
    tempByte = bytes;
    unit = `${UNITS[index]}`

    let formattedBytesData: byteFormattedData = {
      data: `${parseFloat(bytes.toFixed(2))} ${UNITS[index]}`,
      byte: tempByte,
      unit: `${UNITS[index]}`
    }
    return formattedBytesData;
  }

  removeAddedDocument(documentIndex: number, fileSize: number): void {
    if (documentIndex > -1) {
      const selectedfileSize = (fileSize / 1048576);
      this.uploadedFileList.splice(documentIndex, 1);
      this.attachedFileSize = this.attachedFileSize - selectedfileSize;
      const allowedFileSize = this.attachedFileSize <= 6.0
    if (allowedFileSize) {
      this.invalidTotalAttchments = false;
    } else {
      this.invalidTotalAttchments = true;
    }
    }
  }

  checksignDocFileSize(): void{
    const allowedFileSize = (this.fileSize / 1048576) <= 6.0
    if (allowedFileSize) {
      this.invalideFileSize = false
    } else {
      this.invalideFileSize = true
    }
  }

  onUploadAttachment(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.attachments = e.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  public uploadFile(event: any) {
    let $img: any = document.querySelector('#upload-doc');
    if (event.target.files[0].type == 'application/pdf') {
      if (typeof (FileReader) !== 'undefined') {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.pdfSrc = e.target.result;
        };
        this.isPdfUploaded = true;
        reader.readAsArrayBuffer($img.files[0]);
      }
      this.signDocumentsAction = 'save_sign_doc';
      const docUrl = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf#toolbar=0';
      this.fileSource = this.sanitizer.bypassSecurityTrustResourceUrl(docUrl);
    } else {
      alert('please upload pdf file')
    }
  }

  onSendEmailViaInvoices(item: InvoiceTableData): void {
    this.data.action = 'Send Email';
    this.getSendEmailForm();
    let subject: string = `Invoice_${item.invoiceNumber}`;
    this.sendEmailForm.get('subject').setValue(subject);

    const fileObject = {
      FileName: subject ? subject : '',
      AttachmentByteData: item.AttachmentByte,
      FileType: "application/pdf",
    }
    this.finalUploadedList.push(fileObject)
    this.uploadedFileList = [];
    this.fileDetails = { fileName: subject, fileSize: '',size: '', unit: '' }
    this.uploadedFileList.push(this.fileDetails);
  }

  addKeywordFromInput(event: MatChipInputEvent) {
    if (event.value) {
      this.keywords.add(event.value);
      event.chipInput!.clear();
    }
  }

  onMessageType(e: KeyboardEvent): void {
    let smsTypedText = e.toString();
    this.isSMSTyped = smsTypedText?.length > 0 ? true : false;

    const textarea = e.target as HTMLTextAreaElement;

    if (e.key === 'Enter' || e.key === 'Backspace') {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
      textarea.style.lineHeight = '1';
      const newHeight = textarea.scrollHeight + 50;
      this.currentPopupHeight = Math.max(this.popupHeight, newHeight);
    }
  }

  removeKeyword(keyword: string) {
    this.keywords.delete(keyword);
  }

  addTab(event): void {
    if (event.value) {
      if (this.validateEmail(event.value)) {
        this.emailList.push({ value: event.value, invalid: false });
      } else {
        this.emailList.push({ value: event.value, invalid: true });
        this.sendEmailForm.controls['sendTo'].setErrors({ 'incorrectEmail': true });
      }
    }
    if (event.input) {
      event.input.value = '';
    }
  }

  addTabCC(event): void {
    if (event.value) {
      if (this.validateEmail(event.value)) {
        this.emailListCC.push({ value: event.value, invalid: false });
      } else {
        this.emailListCC.push({ value: event.value, invalid: true });
        this.sendEmailForm?.controls['sendToCc'].setErrors({ 'incorrectEmail': true });
      }
    }
    if (event.input) {
      event.input.value = '';
    }
  }

  addTabBCC(event): void {
    if (event.value) {
      if (this.validateEmail(event.value)) {
        this.emailListBCC.push({ value: event.value, invalid: false });
      } else {
        this.emailListBCC.push({ value: event.value, invalid: true });
        this.sendEmailForm?.controls['sendToBcc'].setErrors({ 'incorrectEmail': true });
      }
    }
    if (event.input) {
      event.input.value = '';
    }
  }

  removeEmail(data: any): void {
    if (this.emailList.indexOf(data) >= 0) {
      this.emailList.splice(this.emailList.indexOf(data), 1);
    } else if (this.emailListCC.indexOf(data) >= 0) {
      this.emailListCC.splice(this.emailList.indexOf(data), 1);
    }
    this.getSendEmailForm()
  }

  removeEmailBcc(data: any): void {
    if (this.emailListBCC.length > 0) {
      this.emailListBCC.splice(this.emailListBCC.indexOf(data), 1);
    }
  }

  private validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  saveSignDocument(currentAction: string): void {
    this.isSaveExitSpinner = true;
    const timeStamp = format(new Date(), 'yyMMddHMs')
    const keysObject = { "CollectionDocumentsId": timeStamp };
    const request = {
      "docTypeId": DocumentTypeEnum.SignDocumentId,
      "systemName": "CollectionDocuments",
      "fileName":  this.ptpFileText ? this.ptpFileText : this.selectedFileName,
      "keys": keysObject,
      "documentStatus": 5,
      "documentStatusText": "Received",
      "fileExtension": "application/pdf",
      "documentSet": 9,
      "documentDescription": this.docUploadName != null ? this.docUploadName : 'New',
      "fileAsBase64": this.signDocumentBase64
    };

    const payload = {
      FinPayeeId: this.data.details.finpayeeId,
      PolicyId: this.data.details.policyId,
      DocumentUrl: this.ptpFileText ? this.ptpFileText : this.selectedFileName ? this.selectedFileName : '',
      SignedDocumentUrl: this.ptpFileText ? this.ptpFileText : this.selectedFileName ? this.selectedFileName : '',
      Type: this.ptpFileText,
      SignedBy: this.loggedUser.email,
      SignedDocumentDoc: { ...request }
    }

    this.debtorApiService.addDebtcareSignDocument(payload).subscribe((res: any) => {
      if (res && res.data == DataResponseEnum.Success) {
        this.toastr.successToastr('Document has been uploaded successfully.', '', true);
        this.isSaveExitSpinner = false;
        this.getSignDocumentDetails(this.data.details.finpayeeId,this.data.details.policyId, true)
        if (currentAction == 'save_exit') {
          this.dialogRef.close({ key: DebtcareActionDialogEnum[DebtcareActionDialogEnum.UpdateStatus] });
        } else {
          this.signatureContainer = true;

          // this.finalUploadedFile = this.signDocumentBase64
          this.finalUploadedList = []
          const fileObject = {
            FileName: this.selectedFileName ? this.selectedFileName : '',
            AttachmentByteData: this.signDocumentBase64.split(';base64,')[1],
            FileType: "application/pdf",
          }
          this.finalUploadedFile = fileObject;
          this.finalUploadedList.push(fileObject)

          this.saveAndSendEmail();
        }
      } else {
        this.toastr.errorToastr(res.message, '', true);
        this.isSaveExitSpinner = false;
      }
    })

  }

  saveAndSendEmail(): void {
    this.dataService.setActionStatus('saved')
    this.data.action = 'Send Email';
    this.invoicesAction = 'send-email';
    this.uploadedFileList.push(this.fileDetails);
    this.checkFileSize();
  }

  getSignDocForm(): void {
    this.signDocPTPForm = this.fb.group({
      ptpFileName: ['', Validators.required]
    })
  }

  getFiltedOptionCollectionStatus(): void {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterCollectionStatus(value || '')),
    );
    this.filteredOptions.subscribe((dataValues: any) => {
    })
  }

  private filterCollectionStatus(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.statusList?.filter((option: any) => option.statusCategoryName.toLowerCase().includes(filterValue));
  }

  getFiltedOptionDepartment(): void {
    this.filteredOptionsDepartment = this.myControl1.valueChanges.pipe(
      startWith(''),
      map(value => this.filterDepartment(value || '')),
    );
    this.filteredOptionsDepartment.subscribe((data: any) => {
    })
  }

  private filterDepartment(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.DepartmentList.filter((option: any) => option.departmentName.toLowerCase().includes(filterValue));
  }

  getFiltedOptionTransferTo(): void {
    this.filteredOptionsTransferTo = this.myControl2.valueChanges.pipe(
      startWith(''),
      map(value => this.filterTransferTo(value || '')),
    );

    this.filteredOptionsTransferTo.subscribe((dataval: any) => {

    })
  }

  private filterTransferTo(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.TransferToList.filter((option: any) => option.displayName.toLowerCase().includes(filterValue));
  }

  openActionDialog(action: string, data: any, dialogWidth: string): void {
    this.dialog.open(ActionDialogComponent, {
      width: dialogWidth,
      data: {
        action: action,
        data: data
      }
    }).afterClosed().subscribe((res: any) => {
      if (res && res.key == DataResponseEnum.Success) {
        this.isCommonSpinner = true;
        this.debtorApiService.deleteSignDocument(data.id).subscribe((res: any) => {
          if (res) {
            this.isCommonSpinner = false;
            this.toastr.successToastr('Document has been deleted successfully');
            this.getSignDocumentDetails(this.data.details.finpayeeId,this.data.details.policyId, false)
          } else {
            this.toastr.errorToastr(res.message, '', true);
            this.isCommonSpinner = false;
          }
        })
      }
    })
  }

  onUploadDocument(): void {
    this.isDocUploadEnabled = true;
  }
  UploadDocuments(): void {
    this.registrationDocumentsUploadControlComponent.isUploading = true;
    const files = this.registrationDocumentsUploadControlComponent.getUploadedFiles();
    let policyId = 169778;
    let selectedDocumentId = 21
    for (const file of files) {
      const uploadDocument = new UploadDocument();
      uploadDocument.name = file.name;
      uploadDocument.documentToken = file.token;
      uploadDocument.policyId = policyId;
      uploadDocument.isActive = true;
      uploadDocument.requiredDocumentId = selectedDocumentId;
      this.policyService.addDocument(uploadDocument).subscribe(s => s);
    }
    this.dialogRef.close();
  }

  downloadInvoice(invoiceId: number): void{
    this.downloadSignDocument(invoiceId)
  }

  downloadSignDocument(id: number) {
    this.isCommonSpinner = true;
    this.documentManagementService.GetDocumentBinary(id).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
      if (result) {
        const byteCharacters = atob(result.fileAsBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const b: any = new Blob([byteArray], {
          type: result.mimeType
        });
        let fileName = result.fileName;
        saveAs(b, fileName);
        this.isCommonSpinner = false;
      }
    });
  }

  applyFilterStaus(value: string) {
    if (!value || value.trim() === '') {
      this.filteredStatusList = this.statusList.slice();
      return;
    }
    const filterValue = value.toLowerCase();
    this.filteredStatusList = this.statusList.filter(option =>
      option.statusCategoryName.toLowerCase().includes(filterValue)
    );
  }
  onNoClick(): void {
    this.dialogRef.close(false);
  }
  searchValueStatus(searchText: string): void {
    if (searchText.length > 0 && this.statusList) {
      const filterValue = searchText.toLowerCase();
      this.selectedStatusoption = this.statusList.filter(o => o.statusCategoryName.toLowerCase().includes(filterValue));
    } else {
      this.selectedStatusoption = [...this.statusList || []];
    }
  }
  onClickInputField() {
    this.updateStatus.nativeElement.focus();
  }
  enableDropdownOptions() {
    this.isDropdownOpen = !this.isDropdownOpen;  
    setTimeout(() => {
      const dropdownPanel = document.querySelector('.mat-autocomplete-panel');
      if (dropdownPanel) {
        if (this.isDropdownOpen) {
          dropdownPanel.classList.add('visible');
        } else {
          dropdownPanel.classList.remove('visible');
        }
      }
    });
  }

  downloadInvoiceFile(InvToken: number): void{
    this.isCommonSpinner = true;
    this.debtorApiService.getDebtCareInvoiceDocument(InvToken.toString()).subscribe(res => {
      if(res && res.invoiceDocumentBytes){
            const byteCharacters = atob(res.invoiceDocumentBytes);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            let fileName = res?.invoiceId.toString() + '.pdf'
            this.isCommonSpinner = false;
            saveAs(blob, fileName);
        }     
    })
  }

  getInvoiceByteFile(data: InvoiceTableData){
    this.isCommonSpinner = true;
    this.debtorApiService.getDebtCareInvoiceDocument(data.invoiceId.toString()).subscribe(res => {
      if(res && res.invoiceDocumentBytes){
          this.isCommonSpinner = false;
          const fileData = { AttachmentByte: res.invoiceDocumentBytes, ...data  }
          const totalFileSize = this.base64Size(res.invoiceDocumentBytes);
          const currnetFileSize = (totalFileSize / 1048576);
          this.attachedFileSize = this.attachedFileSize + currnetFileSize; 
          this.onSendEmailViaInvoices(fileData)
      }
            
    })
  }

  base64Size(base64String: string): number {
    base64String = base64String.replace(/\s/g, '');
    const base64StringLength = base64String.length;
    const paddingCharacters = (base64String.match(/=/g) || []).length;
    const originalSize = (base64StringLength * 3 / 4) - paddingCharacters;
    return originalSize;
  }

  navigateToNewMessage(){
    this.sendSMSForm.get('contactNumber').setValue(this.data.contactNumber)
  }

  onCheckNotesCount(event: Event): void{
    this.updateStatusNotesLength = event.toString().length;
  }
  
}

