import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { LegalApiService } from '../services/legal-api.service';
import { CommonDailogComponent } from '../common-dailog/common-dailog.component';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';
import { LegalModuleEnum } from 'projects/shared-models-lib/src/lib/enums/legal-module-enum';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ExportFileService } from 'projects/marketingcare/src/app/marketing-manager/services/export-file.service';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { takeUntil } from 'rxjs/operators';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import * as saveAs from 'file-saver';
import { format } from 'date-fns';
import { FileDownloadService } from 'projects/debtcare/src/app/debt-manager/services/file-download.service';
import { UserData } from '../../models/shared/interfaces/userdata.modal';
import { ActivatedRoute } from '@angular/router';
import { DebtCareService } from 'projects/debtcare/src/app/debt-manager/services/debtcare.service';
import { DatePipe } from '@angular/common';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { EncryptionUtility } from 'projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility';

export interface info {
  key: string,
  value: string
}

export interface opion {
  icon: string,
  text: string
}

export interface actionLogs {
  id: number,
  referralId: number,
  title: string,
  comment: string,
  addedByUser: string,
  date: string,
  time: string,
  customerName: string,
  module: string,
  isDeleted: boolean,
  createdBy: string,
  createdDate: string,
  modifiedBy: string,
  modifiedDate: string
}

@Component({
  selector: 'app-tribunal-details',
  templateUrl: './tribunal-details.component.html',
  styleUrls: ['./tribunal-details.component.css']
})
export class TribunalDetailsComponent extends UnSubscribe implements OnInit {
  @ViewChild('content', { static: false }) content: any;
  showShortDesciption = true

  show: boolean[] = [];
  item: any = { comment: '' };
  userDetails: any | undefined;
  information: info[] = [];
  userDataResponse: UserData;
  userActionLogs: actionLogs[] = [];
  isInfoLoading: boolean = false;
  isLogsLoading: boolean = false
  userInfo: any = {};
  currentAssessmentDetails: any = {};
  currentStatus: string | undefined = undefined;
  canEditNotes: boolean;
  canEditAssesment: boolean;
  canEditDocPack: boolean;
  canEditMeeting: boolean;
  canEditJudgeDec: boolean;
  enableTabs: boolean = false;
  showSearchInput: boolean = false;
  filteredList: any[] = [];
  uniqueDropdownOptions: string[] = [];
  selectedOption: string = '';
  filteredOptions: string[] = [];
  selectedOptionsControl = new FormControl();
  previousSelections: string[] = [];
  currentSelections: string[] = [];
  hasDuplicateTitles: boolean = false;
  fromDate: Date | null = null;
  toDate: Date | null = null;

  selectedFromDate: Date | null = null;
  selectedToDate: Date | null = null;
  fromDateControl = new FormControl();
  toDateControl = new FormControl();
  filteredLogs = [];
  isDateFilterSelected: boolean = false;
  isSpinner: boolean = false;
  dateRangeForm: FormGroup;

  constructor(
    private dataS: DataService,
    public dialog: MatDialog,
    private apiService: LegalApiService,
    private excelService: ExportFileService,
    private documentManagementService: DocumentManagementService,
    private readonly fileDownloadService: FileDownloadService,
    private route: ActivatedRoute,
    private dataService: DebtCareService,
    private datePipe: DatePipe
  ) { 
    super();
  }

  ngOnInit(): void {
    this.getCurrentUserDetails();
    this.route.queryParams.subscribe(params => {
      if(params && params['data']){
        const data = params['data'];
        const details = JSON.parse(decodeURIComponent(data));
        this.userDetails = details;
        this.getLegalCareAssessment(this.userDetails.objectionId);
        this.getTribunalInformation();
        this.getTribunalActionLogs();
      }
    });
    this.setPermissionForNotes();
    this.setPermissionForAssesment();
    this.setPermissionForDocumentPack();
    this.setPermissionForMeeting();
    this.setPermissionForJudgementDecision();
    this.populateDropdownOptions();
    this.filteredLogs = this.userActionLogs;
    const today = new Date();
    this.toDateControl.setValue(today);
    this.fromDateControl.setValue(today);
    if(this.showSearchInput){
      this.filterContent();
      this.filterLogsByDateRange()
    }
  
  }
  fromDateSelected(event: MatDatepickerInputEvent<Date>): void {
    this.fromDate = event.value;
  }

  toDateSelected(event: MatDatepickerInputEvent<Date>): void {
    this.toDate = event.value;
  }
  fromDateFilter = (date: Date): boolean => {
    return !this.toDate || date <= this.toDate;
  }
  toDateFilter = (date: Date): boolean => {
    return !this.fromDate || date >= this.fromDate;
  }
  setPermissionForNotes(): void {
    this.canEditNotes = true;
  }

  setPermissionForAssesment(): void {
    this.canEditAssesment = true;

  }

  setPermissionForDocumentPack(): void {
    this.canEditDocPack = true;

  }

  setPermissionForMeeting(): void {
    this.canEditMeeting = true;

  }

  setPermissionForJudgementDecision(): void {
    this.canEditJudgeDec = true;

  }



  getCurrentUserDetails(): void {
    if (sessionStorage.getItem('auth-profile')) {
      this.userInfo = JSON.parse(EncryptionUtility.decryptData(sessionStorage.getItem('auth-profile')));
    }
  }


  getTribunalInformation(): void {
    this.isInfoLoading = true;
    this.apiService.getLegalCareUserInformation(this.userDetails.id).subscribe((res: any) => {
      if (res) {
        this.userDataResponse = res['data'][0];
        this.getInfo();
        this.isInfoLoading = false;
      }
    })
  }

  getTribunalActionLogs(): void {
    this.isLogsLoading = true;
    let moduleId = 3;
    this.apiService.getLegalCareActionLogsRec(this.userDetails.objectionId, moduleId).subscribe((res: any) => {
      if (res) {
        this.userActionLogs = res['data'].map(item => ({ ...item, showShortDesciption: true }));
        this.isLogsLoading = false;
        this.populateDropdownOptions();

      }
    })
  }

  getInfo(): void {
    if (this.userDataResponse) {
      this.information = [
        {
          key: 'Class',
          value: this.userDataResponse?.class
        },
        {
          key: 'Policy Number',
          value: this.userDataResponse?.policyNumber
        },
        {
          key: 'Date of Accident',
          value: this.userDataResponse?.dateOfAccident.includes('T') ?
            this.userDataResponse?.dateOfAccident.split('T')[0] : this.userDataResponse?.dateOfAccident
        },
        {
          key: 'Claim Number',
          value: this.userDataResponse?.claimNumber
        },
        {
          key: 'Liability Status',
          value: this.userDataResponse?.liabilityStatus
        },
        {
          key: 'System / Report Referal',
          value: this.userDataResponse?.systemReportReferal
        },
        {
          key: 'Expenses Value',
          value: this.userDataResponse?.expensesValue.toString()
        },
        {
          key: 'Date of Referal',
          value: this.userDataResponse?.dateOfReferral.includes('T') ?
            this.userDataResponse?.dateOfReferral.split('T')[0] : this.userDataResponse?.dateOfReferral
        },
        {
          key: 'Description of Accidenat',
          value: this.userDataResponse?.descriptionOfAccident
        },
        {
          key: 'Date Assessed',
          value: this.userDataResponse?.dateAssessed.includes('T') ?
            this.userDataResponse?.dateAssessed.split('T')[0] : this.userDataResponse?.dateAssessed
        },
        {
          key: 'Comments',
          value: this.userDataResponse?.comments
        }
      ]
    }
  }

  openDialog(value: string, dialogWidth: string): void {
    this.dialog.open(CommonDailogComponent, {
      width: dialogWidth,
      data: {
        action: value,
        details: this.userDetails ? this.userDetails : undefined,
        userDataResponse: this.userDataResponse ? this.userDataResponse : undefined,
        currentModuleId: LegalModuleEnum.Tribunal.toString(),
        assessmentDetails: this.currentAssessmentDetails
      }
    }).afterClosed().subscribe((res) => {
      if (res) {
        if (res.status && res.status == DataResponseEnum.Success) {
          this.getTribunalActionLogs();
          this.getLegalCareAssessment(this.userDetails?.objectionId)
        }
        if (res.status && res.status == DataResponseEnum.Success) {
          this.getTribunalActionLogs();
        }
      }
    });
  }

  getLegalCareAssessment(id: number): void {
    this.apiService.getLegalCareAssessment(id).subscribe((res: any) => {
      if (res && res.data?.length > 0) {
        this.currentAssessmentDetails = res.data[0];
      } else {
        this.currentAssessmentDetails = {}
      }
    })
  }

  alterDescriptionText(item: any) {
    item.showShortDesciption = !item.showShortDesciption
  }
  toggleSearchInput() {
    this.showSearchInput = !this.showSearchInput;
  }

  filterContent(): void {
    const selectedOptions = this.selectedOptionsControl.value;
    let filteredResults = this.userActionLogs;

    if (selectedOptions && selectedOptions.length > 0) {

      filteredResults = filteredResults.filter(item => {
        return selectedOptions.some(option => item.title.includes(option));
      });
    }
  
    if (this.fromDateControl.value && this.toDateControl.value) {
      const fromDate = new Date(this.fromDateControl.value);
    const toDate = this.dataService.setTimeInDateRange(new Date(this.toDateControl.value));
    
      filteredResults = filteredResults.filter(item => {
        const fromDate = new Date(this.fromDateControl.value);
        const toDate = new Date(this.toDateControl.value);
      });
    }

    this.filteredList = filteredResults;
  
    const uniqueLogTitles = Array.from(new Set(this.filteredList.map(item => item.logTitle)));
    this.hasDuplicateTitles = uniqueLogTitles.length !== this.filteredList.length;
  }
  
  filterFilteredList(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredList = this.userActionLogs;
      return;
    }

    this.filteredList = this.filteredList.filter(item => {
      return (
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.createdDate.split('T')[0].toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  filterList(searchTerm: string): void {
    const uniqueValues = new Set<string>();

    this.userActionLogs.forEach(item => {
      if (item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        uniqueValues.add(item.title);
      }
    });

    this.filteredOptions = Array.from(uniqueValues).sort();
    const selectedOptions = this.selectedOptionsControl.value || [];

    this.filteredOptions = [...selectedOptions, ...this.filteredOptions];
  
  }
  handleSpaceKey(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.stopPropagation(); // Prevent the space key event from propagating
    }
  }
  preventFocusShift(event: MouseEvent): void {
    event.stopPropagation();
}
  populateDropdownOptions(): void {
    const uniqueLogTitles: string[] = [];

    this.userActionLogs.forEach(item => {
      if (!uniqueLogTitles.includes(item.title)) {
        uniqueLogTitles.push(item.title);
      }
    });

    this.filteredOptions = uniqueLogTitles.sort();
  }

  downloadActionLogReport(): void {
    this.exportAsXLSX(this.filteredList);
  }

  exportAsXLSX(excelJsonData: any): void {
    this.excelService.exportAsExcelFile(excelJsonData, "sample");
  }
  
  filterLogsByDateRange(): void {
    const fromDate = new Date(this.fromDateControl.value);
    const toDate = new Date(this.toDateControl.value);
    const today = new Date(); 
  
    if (!fromDate || !toDate || isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      this.filteredLogs = this.userActionLogs;
      this.filterContent(); 
      return;
    }
  
    this.isDateFilterSelected = true;
  
    let filteredResults = this.userActionLogs.filter(log => {
      const logDate = new Date(log.date);
      return (logDate >= fromDate && logDate <= toDate) || logDate.toDateString() === today.toDateString();
    });
  
    this.filteredLogs = filteredResults;
    this.filterContent(); 
    this.applyFilter();
    this.toggleSearchInput();
  }
  
  

applyFilter(): void {
    const selectedOptions = this.selectedOptionsControl.value;
    if (selectedOptions && selectedOptions.length > 0) {
      this.filteredLogs = this.filteredLogs.filter(log => {
        return selectedOptions.includes(log.title);
      });
    }

    this.filteredList = this.filteredLogs;
}

  resetFilters(): void {
    this.selectedOptionsControl.reset();
    this.fromDateControl.reset();
    this.toDateControl.reset();
    this.filteredList = [];
    this.filteredOptions = this.getAllOptions();
    this.filteredLogs = this.userActionLogs;
    this.isDateFilterSelected = false;
    this.toggleSearchInput();
  }
  getAllOptions(): string[] {
    return Array.from(new Set(this.userActionLogs.map(item => item.title))).sort();
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

  getDownloadDocStatus(value: string): boolean {
    let documentId = Number(value);
    return isNaN(documentId) ? false : true;
  }

  selectAllOptions(checked: boolean) {
    if (checked) {
      this.selectedOptionsControl.patchValue(this.filteredOptions);
    } else {
      this.selectedOptionsControl.patchValue([]);
    }
  }

  exportToPdf(): void {
    const data = (this.filteredList && this.filteredList?.length > 0) ? this.filteredList : this.userActionLogs;
    if(data?.length > 0){
      const formattedData = data.map((item) => {
      return {
         ID: item.id,
         Title: item.title,
         Description: item.comment,
        'Modified By': item.modifiedBy,
        'Assigned On': format(new Date(item.createdDate), "yyyy-MM-dd"),
        'Assigned Time': item.time,
        'Modified On': format(new Date(item.modifiedDate),"yyyy-MM-dd")
      }
      })
      let currentTime = format(new Date(),'yyMMddHHmmss')
      this.fileDownloadService.exportToPdf({data:formattedData,documentName: `Legal_action_logs_${currentTime}.pdf`,fontSize: 8});
    }
  }
  
}

