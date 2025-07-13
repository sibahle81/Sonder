import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DebtorCommonDialogComponent } from '../debtor-common-dialog/debtor-common-dialog.component';
import { DebtcareApiService } from '../../services/debtcare-api.service';
import { DataService } from '../../services/data.service';
import { format } from 'date-fns';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';
import { FormControl } from '@angular/forms';
import { ExportFileService } from 'projects/marketingcare/src/app/marketing-manager/services/export-file.service';
import { DebtcareActionDialogEnum } from 'projects/shared-models-lib/src/lib/enums/debtcare-action-dialog-enum';
import { AgeAnalysisDetails } from '../shared/models/age-analyisi-details';
import { FileDownloadService } from '../../services/file-download.service';
import { ActivatedRoute } from '@angular/router';
import { DebtCareService } from '../../services/debtcare.service';


export interface UserData {
  date: string,
  status: string,
  acknowledgement: string,
  customerNumber: string,
  customerName: string,
  finpayeeId: number
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
  icon: string,
  headingText: string,
  notes: string,
  name: string
}

export interface FilteredItem {
  actionType: string;
  agentId: number;
  assignDate: string;
  assignTime: string;
  createdBy: string;
  createdDate: string;
  description: string;
  finPayeeId: number;
  id: number;
  isActive: boolean;
  isDeleted: boolean;
  logTitle: string;
  modifiedBy: string;
  modifiedDate: string;
  showShortDesciption: boolean;
}

@Component({
  selector: 'app-team-leader-details',
  templateUrl: './team-leader-details.component.html',
  styleUrls: ['./team-leader-details.component.css']
})
export class TeamLeaderDetailsComponent implements OnInit {
  @ViewChild('descriptionText') descriptionText: ElementRef;

  userDetails: any | undefined;
  information: info[] = [];
  HeadingTabs: string[] = ['Personal Information', 'All Address', 'More Details'];
  ageAnalysisDetails: AgeAnalysisDetails;
  selectedTab: string = this.HeadingTabs[0];
  allAddressSubTabs: string[] = ['Personal', 'Residential', 'Postal', 'Employer'];
  allMoreDetailsSubTabs: string[] = ['Book', 'Involved Party', 'Supp. Information', 'Summary'];
  selectedAllAddressSubTab: string = this.allAddressSubTabs[0];
  selectedMoreDetailsSubTab: string = this.allMoreDetailsSubTabs[0];
  allInformation: info[] = [];
  userInformations: any = {}
  isInfoLoading: boolean = false;
  isLogsLoading: boolean = false;
  actionLogs: any[] = [];
  updateStatusData: any = {};
  canEditUpdateState: boolean;
  canEditDoc: boolean;
  canEditEmail: boolean;
  canEditSms: boolean;
  canEditInv: boolean;
  isNoInformation: boolean = false;
  item: any = { comment: '' };
  showSearchInput: boolean = false;
  filteredList: FilteredItem[] = [];
  uniqueDropdownOptions: string[] = [];
  selectedOption: string = '';
  filteredOptions: string[] = [];
  selectedOptionsControl = new FormControl();
  previousSelections: string[] = [];
  currentSelections: string[] = [];
  hasDuplicateTitles: boolean = false;
  ageAnalysisLoading: boolean = false;

  fromDateControl = new FormControl();
  toDateControl = new FormControl();
  filteredLogs: FilteredItem[] = [];
  isDateFilterSelected: boolean = false;
  selectedFromDate: Date | null = null;
  selectedToDate: Date | null = null;
  nextLine: string = '\n';
  
  constructor(
    private dataS: DataService,
    public dialog: MatDialog,
    private DebtcareApiService: DebtcareApiService,
    private excelService: ExportFileService,
    private readonly fileDownloadService: FileDownloadService,
    private route: ActivatedRoute,
    private debtcareDataService: DebtCareService
  ) { }

  ngOnInit(): void {
    this.getData();
    this.setPermissionForEmail();
    this.setPermissionForSignDoc();
    this.setPermissionForSms();
    this.setPermissionForUpdateStatus();
    this.getCurrentActionStatus();
    this.populateDropdownOptions();
    const today = new Date();
    this.toDateControl.setValue(today);
    this.fromDateControl.setValue(today);
  }

  getData(): void {
    this.route.queryParams.subscribe(params => {
      if(params && params['data']){
        const data = params['data'];
        const details = JSON.parse(decodeURIComponent(data));
        this.userDetails = details;
        this.getUserInformation(this.userDetails.finpayeeId)
        this.getUserActionLogs(this.userDetails.finpayeeId,this.userDetails.policyId)
        this.getUpdateStatusDetails(this.userDetails.finpayeeId,this.userDetails.policyId)
        this.getInfo();
        this.getAllAddressDetails();
        this.getAgeAnalysisDetails(this.userDetails.policyId);
      }
    });

  }

  setPermissionForUpdateStatus(): void {
    this.canEditUpdateState = true;
  }

  setPermissionForSignDoc(): void {
    this.canEditDoc = true;
  }

  setPermissionForEmail(): void {
    this.canEditEmail = true;
  }

  setPermissionForSms(): void {
    this.canEditSms = true;
  }

  getUserInformation(id: string): void {
    this.isInfoLoading = true;
    this.DebtcareApiService.getDebtCareCollectionAgentInformation(id).subscribe((res: any) => {
      if (res && res['data']) {
        this.isInfoLoading = false;
        this.userInformations = res['data'][0];
        this.allInformation = this.getInfo();
      }
    })

    if (Object.keys(this.userInformations).length === 0) {
      this.isNoInformation = true;
    } else {
      this.isNoInformation = false;
    }
  }

  getUserActionLogs(id: number,policyId: number): void {
    this.isLogsLoading = true;
    this.DebtcareApiService.getDebtCareCollectionAgentActionLogs(id,policyId).subscribe((res: any) => {
      if (res && res['data']) {
        this.actionLogs = res['data'].map(item => ({ ...item, showShortDesciption: true }));
        this.isLogsLoading = false;
        this.populateDropdownOptions();
      }
    })
  }


  getUpdateStatusDetails(finpayid: number, policyId: number): void {
    this.DebtcareApiService.getUpdateStatusDetails(finpayid,policyId).subscribe((res: any) => {
      if (res) {
        this.updateStatusData = res.data;
      }
    })
  }

  getAgeAnalysisDetails(id: number): void {
    this.ageAnalysisLoading = true;
    this.DebtcareApiService.getDebtAgeAnalysis(id).subscribe((res: any) => {
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
        value: this.userInformations.initial
      },
      {
        key: 'Name',
        value: this.userInformations.name
      },
      {
        key: 'Surname',
        value: this.userInformations.surname
      },
      {
        key: 'Id Number',
        value: this.userInformations.idNumber
      },
      {
        key: 'Language',
        value: this.userInformations.language
      },
      {
        key: 'Primary Email ID',
        value: this.userInformations.primaryEmailId
      },
      {
        key: 'Phone 1',
        value: this.userInformations.phone1
      },
      {
        key: 'Phone 2',
        value: this.userInformations.phone2
      },
      {
        key: 'Mobile',
        value: this.userInformations.mobile
      },
      {
        key: 'Fax',
        value: this.userInformations.fax
      },
      {
        key: 'Work Telephone',
        value: this.userInformations.workTelephone
      },
      {
        key: 'Direct Work Telephone',
        value: this.userInformations.directWorkTelephone
      },
      {
        key: 'Employer',
        value: this.userInformations.employer
      }
    ]
  }

  getAllAddressDetails(): info[] {
    return [
      {
        key: 'House / Street Number',
        value: this.userInformations.houseNumber
      },
      {
        key: 'Complex / Building & Unit Number',
        value: this.userInformations.complexBuildingNumber
      },
      {
        key: 'Address Line 1',
        value: this.userInformations.addressLine1
      },
      {
        key: 'Address Line 2',
        value: this.userInformations.addressLine2
      },
      {
        key: 'Postal Code',
        value: this.userInformations.postalCode
      },
      {
        key: 'City',
        value: this.userInformations.city
      },
      {
        key: 'Province',
        value: this.userInformations.province
      },
      {
        key: 'Country',
        value: this.userInformations.country
      }
    ]
  }

  getMoreDetails(): info[] {
    return [
      {
        key: 'Matter Number',
        value: '012451525855'
      },
      {
        key: 'Book',
        value: 'Metals Class 13'
      },
      {
        key: 'Matter Type',
        value: 'Debtor'
      }
    ]
  }

  openDialog(value: string, dialogWidth: string): void {
    this.dialog.open(DebtorCommonDialogComponent, {
      width: dialogWidth,
      data: {
        action: value,
        details: this.userDetails,
        statusInfo: this.updateStatusData?.length > 0 ? this.updateStatusData : undefined
      }
    }).afterClosed().subscribe((res) => {
      if (res && res.key) {
        if (res.key == DebtcareActionDialogEnum[DebtcareActionDialogEnum.UpdateStatus]) {
          this.getUserActionLogs(this.userDetails.finpayeeId,this.userDetails.policyId)
          this.getUpdateStatusDetails(this.userDetails.finpayeeId,this.userDetails.policyId)
        } else if (res.key == DataResponseEnum.Success) {
          let emailDetails = res.email ? res.email : { Subject: '', Body: '' }
          this.addEmailActionLogs(emailDetails)
        }
      }
    });
  }

  addEmailActionLogs(email: any): void {
    const payload = {
      FinPayeeId: this.userDetails.finpayeeId,
      PolicyId: this.userDetails.policyId,
      LogTitle: `Email Sent - (Subject: ${email.Subject})\n\nTo: ${email.Recipients}\nCC: ${email.RecipientsCC}\nBcc: ${email.Recipients}`,
      Description: email.Body,
      AgentId: 0,
      AssignDate: (format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")).toString() + ".000Z",
      AssignTime: format(new Date(), "HH:mm"),
      ActionType: DebtcareActionDialogEnum.Email
    }
    this.DebtcareApiService.addEmailActionLogs(payload).subscribe((res: any) => {
      if (res && res.data == DataResponseEnum.Success) {
        this.getUserActionLogs(this.userDetails.finpayeeId,this.userDetails.policyId)
      }
    })
  }

  onSelectAddressTab(tab: string): void {
    this.selectedAllAddressSubTab = tab;
  }

  onSelectMoreDetailsTab(tab: string): void {
    this.selectedMoreDetailsSubTab = tab;
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
    }
  }
  alterDescriptionText(item: any) {
    item.showShortDesciption = !item.showShortDesciption;
  }

  getCurrentActionStatus(): void {
    this.dataS.getActionStatus().subscribe((res: string) => {
      if (res != null && res == 'saved') {
        this.getUserActionLogs(this.userDetails.finpayeeId,this.userDetails.policyId)
      }
    })
  }
  toggleSearchInput() {
    this.showSearchInput = !this.showSearchInput;
  }

  filterContent(): void {
    const selectedOptions = this.selectedOptionsControl.value;
    if (!selectedOptions) {
      return;
    }
    let filteredResults = this.actionLogs.filter(item => {
      return selectedOptions.some(option =>
        item.logTitle.includes(option) ||
        item.createdDate.split('T')[0].includes(option) ||
        item.description.includes(option)
      );
    });
  

  if (this.fromDateControl.value && this.toDateControl.value) {
    const fromDate = new Date(this.fromDateControl.value);
    const toDate = this.debtcareDataService.setTimeInDateRange(this.toDateControl.value);
    filteredResults = filteredResults.filter(item => {
      const logDate = new Date(item.createdDate.split('T')[0]);
      return logDate >= fromDate && logDate <= toDate;
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
        item.logTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.createdDate.split('T')[0].toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  filterList(searchTerm: string): void {
    const uniqueValues = new Set<string>();

    this.actionLogs.forEach(item => {
      if (item.logTitle.toLowerCase().includes(searchTerm.toLowerCase())) {
        uniqueValues.add(item.logTitle);
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
      if (!uniqueLogTitles.includes(item.logTitle)) {
        uniqueLogTitles.push(item.logTitle);
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
  const isTodayFrom = fromDate.toDateString() === today.toDateString();
  const isTodayTo = toDate.toDateString() === today.toDateString();

  if (!fromDate || !toDate || isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    this.filteredLogs = this.actionLogs;
    this.filterContent(); 
    return;
  }

  this.isDateFilterSelected = true;

    const toDateValue = this.debtcareDataService.setTimeInDateRange(this.toDateControl.value)

  let filteredResults = this.actionLogs.filter(log => {
    const logDate = new Date(log.date);

    if (isTodayFrom && isTodayTo) {
      return logDate.toDateString() === today.toDateString();
    } else {
      return logDate >= fromDate && logDate <= toDateValue;
    }
  });

  this.filteredLogs = filteredResults;
  this.applyFilter();
  this.toggleSearchInput();
  this.filterContent(); 
}
applyFilter(): void {
  const selectedOptions = this.selectedOptionsControl.value;
  if (selectedOptions && selectedOptions.length > 0) {
    this.filteredLogs = this.filteredLogs.filter(log => {
      return selectedOptions.includes(log.logTitle);
    });
  }

  this.filteredList = this.filteredLogs;
}
applyFilters(): void {
  this.filterLogsByDateRange();
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
    return Array.from(new Set(this.actionLogs.map(item => item.logTitle))).sort();
}
  selectAllOptions(checked: boolean) {
    if (checked) {
      this.selectedOptionsControl.patchValue(this.filteredOptions);
    } else {
      this.selectedOptionsControl.patchValue([]);
    }
  }

  exportToPdf(): void {
    const data = (this.filteredList && this.filteredList?.length > 0) ? this.filteredList : this.actionLogs;
    const formattedData = data.map((item) => {
      return {
         ID: item.id,
        'Assign ID': item.agentId == 0 ? '-' : item.agentId.toString(),
         Title: item.logTitle,
         Description: item.description,
        'Modified By': item.modifiedBy,
        'Assigned On': format(new Date(item.createdDate), "yyyy-MM-dd"),
        'Assign Time': item.assignTime,
        'Modified On': format(new Date(item.modifiedDate),"yyyy-MM-dd")
      }
    })
    let currentTime = format(new Date(),'yyMMddHHmmss')
    this.fileDownloadService.exportToPdf({data:formattedData,documentName: `Debtcare_action_logs_${currentTime}.pdf`,fontSize: 8});
  }

}





