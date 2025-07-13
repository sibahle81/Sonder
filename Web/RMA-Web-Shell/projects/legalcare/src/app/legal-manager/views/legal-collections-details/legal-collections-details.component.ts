import { DataService } from '../services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonDailogComponent } from '../common-dailog/common-dailog.component';
import { LegalApiService } from '../services/legal-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { format } from 'date-fns';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';
import { ExportFileService } from 'projects/marketingcare/src/app/marketing-manager/services/export-file.service';
import { FormControl } from '@angular/forms';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { takeUntil } from 'rxjs/operators';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import * as saveAs from 'file-saver';
import { FileDownloadService } from 'projects/debtcare/src/app/debt-manager/services/file-download.service';
import { DebtCareService } from 'projects/debtcare/src/app/debt-manager/services/debtcare.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DebtcareApiService } from 'projects/debtcare/src/app/debt-manager/services/debtcare-api.service';
import { AgeAnalysisDetails } from 'projects/debtcare/src/app/debt-manager/views/shared/models/age-analyisi-details';
import { EncryptionUtility } from 'projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility';

export interface UserData {
  date: string,
  status: string,
  acknowledgement: string,
  finPayeeId: number
}

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

interface userParams {
  id: number,
  customerName: string
}

@Component({
  selector: 'app-legal-collections-details',
  templateUrl: './legal-collections-details.component.html',
  styleUrls: ['./legal-collections-details.component.css']
})
export class LegalCollectionsDetailsComponent extends UnSubscribe implements OnInit {
  @ViewChild('content', { static: false }) content: any;
  show: boolean[] = [];

  userDetails: any = {}
  userDetails2: any = {}
  allInformation: info[] = [];

  information: info[] = []
  HeadingTabs: string[] = ['Personal Information', 'All Address', 'More Details']
  selectedTab: string = this.HeadingTabs[0];
  allAddressSubTabs: string[] = ['Personal'];
  allMoreDetailsSubTabs: string[] = ['Book'];
  selectedAllAddressSubTab: string = this.allAddressSubTabs[0];
  selectedMoreDetailsSubTab: string = this.allMoreDetailsSubTabs[0];
  isLogsLoading: boolean = false;
  isInfoLoading: boolean = false;
  isNoInformation: boolean = false;
  canEditEmail: boolean;
  canEditNotes: boolean;
  item: any = { comment: '' };
  actionLogs: actionLogs[] = [];
  userlogDetails: any;
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
  isSpinner: boolean = false;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  ageAnalysisLoading: boolean = false;
  ageAnalysisDetails: AgeAnalysisDetails;
  userParam: userParams = { id: 0, customerName: '' };
  constructor(private dataS: DataService,
    public dialog: MatDialog,
    private LegalApiService: LegalApiService,
    private router: Router,
    private excelService: ExportFileService,
    private dataService: DebtCareService,
    private readonly documentManagementService: DocumentManagementService,
    private readonly fileDownloadService: FileDownloadService,
    private route: ActivatedRoute,
    private debtcareApiService: DebtcareApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.getData();
    this.getUserActionLogs();
    this.setPermissionForEmail();
    this.setPermissionForNotes();
    this.populateDropdownOptions();
    this.filteredLogs = this.actionLogs;
    const today = new Date();
    this.toDateControl.setValue(today);
    this.fromDateControl.setValue(today);
    if(this.showSearchInput){
      this.filterContent();
      this.filterLogsByDateRange()
    }
    this.getAgeAnalysisDetails();
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
  getData(): void {
    this.getUser();

    this.route.queryParams.subscribe(params => {
      if (params && params['data']) {
        const data = params['data'];
        const details = JSON.parse(decodeURIComponent(data));
        this.userDetails = details;
        this.getLegalCollectionInformation(this.userDetails.finPayeeId)
        this.getInfo();
        this.userParam = {
          customerName: this.userDetails.customerName,
          id: this.userDetails.id
        }
      }
    });
  }

  getAgeAnalysisDetails(): void {
    this.ageAnalysisLoading = true;
    this.debtcareApiService.getDebtAgeAnalysis(this.userDetails.policyId).subscribe((res: any) => {
      if (res && res?.data.length > 0) {
        this.ageAnalysisLoading = false;
        this.ageAnalysisDetails = res?.data[0];
      }
    })
  }

  getInfo(): info[] {
    return [
      {
        key: 'Initial',
        value: this.userDetails.initial || "-"
      },
      {
        key: 'Name',
        value: this.userDetails.name || "-"
      },
      {
        key: 'Surname',
        value: this.userDetails.surname || "-"
      },
      {
        key: 'Id Number',
        value: this.userDetails.idNumber || "-"
      },
      {
        key: 'Language',
        value: this.userDetails.language || "-"
      },
      {
        key: 'Primary Email ID',
        value: this.userDetails.primaryEmailId || "-"
      },
      {
        key: 'Phone 1',
        value: this.userDetails.phone1 || "-"
      },
      {
        key: 'Phone 2',
        value: this.userDetails.phone2 || "-"
      },
      {
        key: 'Mobile',
        value: this.userDetails.mobile || "-"
      },
      {
        key: 'Fax',
        value: this.userDetails.fax || "-"
      },
      {
        key: 'Work Telephone',
        value: this.userDetails.workTelephone || "-"
      },
      {
        key: 'Direct Work Telephone',
        value: this.userDetails.directWorkTelephone || "-"
      },
      {
        key: 'Employer',
        value: this.userDetails.employer || "-"
      }
    ]
  }

  getUser(): void {
    this.userlogDetails = JSON.parse(EncryptionUtility.decryptData(sessionStorage.getItem('auth-profile')));
  }

  getAllAddressDetails(): info[] {
    return [
      {
        key: 'House / Street Number',
        value: this.userDetails.houseNumber || "-"
      },
      {
        key: 'Complex / Building & Unit Number',
        value: this.userDetails.complexBuildingNumber || "-"
      },
      {
        key: 'Address Line 1',
        value: this.userDetails.addressLine1 || "-"
      },
      {
        key: 'Address Line 2',
        value: this.userDetails.addressLine2 || "-"
      },
      {
        key: 'Postal Code',
        value: this.userDetails.postalCode || "-"
      },
      {
        key: 'City',
        value: this.userDetails.city || "-"
      },
      {
        key: 'Province',
        value: this.userDetails.province || "-"
      },
      {
        key: 'Country',
        value: this.userDetails.country || "-"
      }
    ]
  }

  getLegalCollectionInformation(id: any): void {
    this.isInfoLoading = true;
    this.LegalApiService.getLegalCollectionUserInformation(id).subscribe((res: any) => {
      if (res) {
        if (res.data?.length > 0) {
          this.isNoInformation = false;
          this.userDetails = { ...res.data[0], customerName: this.userDetails?.customerName, finPayeeId: res.data[0].referralId };
          this.allInformation = this.getInfo();
          this.isInfoLoading = false;
        } else {
          this.isInfoLoading = false;
          this.isNoInformation = true;
        }
      } else {
        this.isInfoLoading = false;
      }
    })
  }

  getMoreDetails(): info[] {
    return [
      {
        key: 'Matter Number',
        value: this.userDetails.matterNumber || "-"
      },
      {
        key: 'Book',
        value: this.userDetails.book || "-"
      },
      {
        key: 'Matter Type',
        value: this.userDetails.matterType || "-"
      }
    ]
  }
  getUserActionLogs(): void {
    let moduleId = 2
    this.isLogsLoading = true;
    this.LegalApiService.getLegalCareActionLogsRec(this.userDetails.id, moduleId).subscribe((res: any) => {
      if (res && res['data']) {
        this.actionLogs = res['data'].map(item => ({ ...item, showShortDesciption: true }));
        this.isLogsLoading = false;
        this.populateDropdownOptions();

      }
    })
  }
  openDialog(value: string, dialogWidth: string): void {
    this.dialog.open(CommonDailogComponent, {
      width: dialogWidth,
      data: {
        action: value,
        details: this.userDetails ? this.userDetails : undefined,
        currentModuleId: "2",
        email: this.userDetails.primaryEmailId
      }
    }).afterClosed().subscribe((res) => {
      if (res) {
        if (res.status && res.status == DataResponseEnum.Success) {
          this.getUserActionLogs();
        }
        if (res.status && res.status == 'email_send') {
           console.log('Id', this.userDetails)
          this.addCollectionActionLogs(this.userDetails);
          this.getUserActionLogs();
        }

      }
    });
  }

  addCollectionActionLogs(userData: any): void {

    const payload = {
      ReferralId: this.userParam.id,
      Title: 'Email Sent',
      Comment: 'Email has been sent successfully',
      AddedByUser: this.userlogDetails['username'],
      CustomerName: this.userParam.customerName,
      Date: new Date(),
      Time: format(new Date(), 'HH:MM:SS'),
      ModuleId: '2',
      ActionType: 'Send Email'
    }
    this.isLogsLoading = true;
    this.LegalApiService.addLegalCareActionLogs(payload).subscribe(res => {
      if (res && res.data && res.data == 1) {
        this.isLogsLoading = false;
        this.getUserActionLogs();
      } else {
        this.isLogsLoading = false;
      }
    })
  }

  setPermissionForNotes(): void {
    this.canEditNotes = true;
  }

  setPermissionForEmail(): void {
    this.canEditEmail = true
  }

  onSelectAddressTab(tab: string): void {
  }
  onSelectHeadingTab(tab: string): void {
    this.selectedTab = tab;
    this.allInformation = [];
    if (this.selectedTab == 'All Address') {
      this.allInformation = this.getAllAddressDetails();
    } else if (this.selectedTab == 'Personal Information') {
      this.allInformation = this.getInfo();
    } else if (this.selectedTab == 'More Details') {
      this.allInformation = this.getMoreDetails();
    } else {
    }
  }
  alterDescriptionText(item: any) {
    item.showShortDesciption = !item.showShortDesciption
  }
  goBack(): void {
    this.router.navigate(['legalcare/legal-collections-admin']);
  }
  toggleSearchInput() {
    this.showSearchInput = !this.showSearchInput;
  }

  filterContent(): void {
    const selectedOptions = this.selectedOptionsControl.value;
    let filteredResults = this.actionLogs;

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
      this.filteredList = this.actionLogs;
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

    this.actionLogs.forEach(item => {
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
  populateDropdownOptions(): void {
    const uniqueLogTitles: string[] = [];

    this.actionLogs.forEach(item => {
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
      this.filteredLogs = this.actionLogs;
      this.filterContent();
      return;
    }

    this.isDateFilterSelected = true;


    let filteredResults = this.actionLogs.filter(log => {
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
    this.filteredLogs = this.actionLogs;
    this.isDateFilterSelected = false;
    this.toggleSearchInput();
  }
  getAllOptions(): string[] {
    return Array.from(new Set(this.actionLogs.map(item => item.title))).sort();
  }
  selectAllOptions(checked: boolean) {
    if (checked) {
      this.selectedOptionsControl.patchValue(this.filteredOptions);
    } else {
      this.selectedOptionsControl.patchValue([]);
    }
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

  exportToPdf(): void {
    const data = (this.filteredList && this.filteredList?.length > 0) ? this.filteredList : this.actionLogs;
    if (data?.length > 0) {
      const formattedData = data.map((item) => {
        return {
          ID: item.id,
          Title: item.title,
          Description: item.comment,
          'Modified By': item.modifiedBy,
          'Assigned On': format(new Date(item.createdDate), "yyyy-MM-dd"),
          'Assigned Time': item.time,
          'Modified On': format(new Date(item.modifiedDate), "yyyy-MM-dd")
        }
      })
      let currentTime = format(new Date(), 'yyMMddHHmmss')
      this.fileDownloadService.exportToPdf({ data: formattedData, documentName: `Legal_action_logs_${currentTime}.pdf`, fontSize: 8 });
    }
  }

}




