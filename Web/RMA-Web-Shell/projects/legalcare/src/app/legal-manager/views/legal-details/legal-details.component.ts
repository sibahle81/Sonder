import { DataService } from '../services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LegalApiService } from '../services/legal-api.service';
import { CommonDailogComponent } from '../common-dailog/common-dailog.component';
import { format } from 'date-fns';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';
import { ExportFileService } from 'projects/marketingcare/src/app/marketing-manager/services/export-file.service';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { takeUntil } from 'rxjs/operators';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import * as saveAs from 'file-saver';
import { FileDownloadService } from 'projects/debtcare/src/app/debt-manager/services/file-download.service';
import { ActivatedRoute } from '@angular/router';
import { DebtCareService } from 'projects/debtcare/src/app/debt-manager/services/debtcare.service';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DatePipe } from '@angular/common';

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
  selector: 'app-legal-details',
  templateUrl: './legal-details.component.html',
  styleUrls: ['./legal-details.component.css']
})
export class LegalDetailsComponent extends UnSubscribe implements OnInit {
  @ViewChild('content', { static: false }) content: any;
  @ViewChild('description', { static: false }) descriptionElement: ElementRef;

  show: boolean[] = [];
  userDetails: any | undefined;
  referralId: number;
  information: any[] = [];
  userDataResponse: any[] = [];
  userActionLogs: actionLogs[] = [];
  isInfoLoading: boolean = false;
  isActionLogsLoading: boolean = false;
  activateTab: boolean = true;
  enableActionTabs: boolean = true;
  isSpinner: boolean = false;
  canEditNotes: boolean;
  canEditPotentialRec: boolean;
  canEditAttrorneyInstr: boolean;
  canEditAttorneyInv: boolean;
  canEditRecoPay: boolean;
  canEditUpdateStat: boolean;
  item: any = { comment: '' };
  showSearchInput: boolean = false;
  filteredList: any[] = [];
  uniqueDropdownOptions: string[] = [];
  selectedOption: string = '';
  filteredOptions: string[] = [];
  selectedOptionsControl = new FormControl();
  previousSelections: string[] = [];
  currentSelections: string[] = [];
  hasDuplicateTitles: boolean = false;
  fromDateControl = new FormControl();
  toDateControl = new FormControl();
  filteredLogs = [];
  isDateFilterSelected: boolean = false;
  selectedFromDate: Date | null = null;
  selectedToDate: Date | null = null;
  legalAdminViewPath = 'Legalcare';
  dateRangeForm: FormGroup;

  constructor(
    private dataS: DataService,
    public dialog: MatDialog,
    private apiService: LegalApiService,
    private excelService: ExportFileService,
    private readonly documentManagementService: DocumentManagementService,
    private readonly fileDownloadService: FileDownloadService,
    private route: ActivatedRoute,
    private dataService: DebtCareService,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {


    this.route.queryParams.subscribe(params => {
      if(params && params['data']){
        const data = params['data'];
        const details = JSON.parse(decodeURIComponent(data));
        this.userDetails = details;
        this.checkActionTabs(this.userDetails.legalCareRefferalStatus)
        this.getUserInformation(this.userDetails.referralId);
        this.getUserAction();
      }
    });

    this.setPermissionForNotes();
    this.setPermissionForPotentialRecovery();
    this.setPermissionForAttorneyInstructions();
    this.setPermissionForAttorneyInvoice();
    this.setPermissionForRecoveredPayments();
    this.setPermissionForUpdateStatus();
    this.onUpdateActionLogs();
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


  checkActionTabs(value: number): void {
    this.enableActionTabs = true;
  }

  onUpdateActionLogs(): void {
    this.dataS.getUpdatedStatus().subscribe((res) => {
      if (res && res == DataResponseEnum.Success) {
        this.getUserAction();
      }
    })
  }

  getUserInformation(id: number): void {
    this.apiService.getLegalCareUserInformation(id).subscribe((res: any) => {
      if (res && res['data'][0]) {
        let tempData: any = {};
        tempData = res['data'][0] ? res['data'][0] : [];
        this.userDataResponse = res['data'][0] ? res['data'][0] : [];
        this.isInfoLoading = false;

        if (tempData?.dateAssessed.includes('1900-01-01')) {
          this.canEditPotentialRec = false;
        } else {
          this.canEditPotentialRec = true;
        }

        this.information = [
          {
            key: 'Class',
            value: tempData?.class
          },
          {
            key: 'Policy Number',
            value: tempData?.policyNumber
          },
          {
            key: 'Date of Accident',
            value: tempData?.dateOfAccident.includes('T') ?
              tempData?.dateOfAccident.split('T')[0] : tempData?.dateOfAccident
          },
          {
            key: 'Claim Number',
            value: tempData?.claimNumber
          },
          {
            key: 'Liability Status',
            value: tempData?.liabilityStatus
          },
          {
            key: 'System / Report Referal',
            value: tempData?.systemReportReferal
          },
          {
            key: 'Expenses Value',
            value: tempData?.expensesValue.toString()
          },
          {
            key: 'Date of Referal',
            value: tempData?.dateOfReferral.includes('T') ?
              tempData?.dateOfReferral.split('T')[0] : tempData?.dateOfReferral
          },
          {
            key: 'Description of Accidenat',
            value: tempData?.descriptionOfAccident
          },
          {
            key: 'Date Assessed',
            value: tempData?.dateAssessed.includes('1900-01-01') ? '--' : format(new Date(tempData?.dateAssessed), 'yyyy-MM-dd')
          },
          {
            key: 'Comments',
            value: tempData?.comments
          }
        ]
      }
    })
  }

  getUserAction(): void {
    let moduleId = 1
    this.isActionLogsLoading = true;
    this.apiService.getLegalCareActionLogsRec(this.userDetails.referralId, moduleId).subscribe((res: any) => {
      if (res && res['data']) {
        this.userActionLogs = res['data'].map((item: any) => ({ ...item, showShortDesciption: true }));
        this.isSpinner = false;
        this.isActionLogsLoading = false;
        this.populateDropdownOptions();
      } else {
        this.isSpinner = false;
      }
    })
  }

  setPermissionForNotes(): void {
    this.canEditNotes = true;

  }

  setPermissionForPotentialRecovery(): void {
    this.canEditPotentialRec = true;

  }

  setPermissionForAttorneyInstructions(): void {
    this.canEditAttrorneyInstr = true;

  }

  setPermissionForAttorneyInvoice(): void {
    this.canEditAttorneyInv = true;
  }

  setPermissionForRecoveredPayments(): void {
    this.canEditRecoPay = true;

  }

  setPermissionForUpdateStatus(): void {
    this.canEditUpdateStat = true;

  }


  getInfo(): void {
    if (this.userDataResponse) {
      let tempData = [];
      this.userDataResponse.forEach((element: any) => {
        tempData = [
          {
            key: 'Class',
            value: element?.class
          },
          {
            key: 'Policy Number',
            value: element?.policyNumber
          },
          {
            key: 'Date of Accident',
            value: element?.dateOfAccident.includes('T') ?
              element?.dateOfAccident.split('T')[0] : element?.dateOfAccident
          },
          {
            key: 'Claim Number',
            value: element?.claimNumber
          },
          {
            key: 'Liability Status',
            value: element?.liabilityStatus
          },
          {
            key: 'System / Report Referal',
            value: element?.systemReportReferal
          },
          {
            key: 'Expenses Value',
            value: element?.expensesValue.toString()
          },
          {
            key: 'Date of Referal',
            value: element?.dateOfReferral.includes('T') ?
              element?.dateOfReferral.split('T')[0] : element?.dateOfReferral
          },
          {
            key: 'Description of Accidenat',
            value: element?.descriptionOfAccident
          },
          {
            key: 'Date Assessed',
            value: element?.dateAssessed.includes('T') ?
              element?.dateAssessed.split('T')[0] : element?.dateAssessed
          },
          {
            key: 'Comments',
            value: element?.comments
          }
        ]
      });

      this.information = tempData
      this.information = [];

    }
  }

  openDialog(value: string, dialogWidth: string): void {
    if (this.enableActionTabs || value == 'Notes') {
      this.dialog.open(CommonDailogComponent, {
        width: dialogWidth,
        data: {
          action: value,
          details: this.userDetails ? this.userDetails : undefined,
          currentModuleId: "1"
        }
      }).afterClosed().subscribe((res) => {
        if (res) {

          if (res.result && res.result == DataResponseEnum.Success) {
            this.activateTab = true;
          }
          if (res.status && res.status == DataResponseEnum.Success) {
            this.getUserAction();
            this.activateTab = true;
          }
        }
      });
    }
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
      const toDate = new Date(this.toDateControl.value);
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
      event.stopPropagation();
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

  exportAsXLSX(excelJsonData: any): void {
    this.excelService.exportAsExcelFile(excelJsonData, this.legalAdminViewPath);
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



