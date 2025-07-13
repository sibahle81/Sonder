
import { Component, ElementRef, HostListener } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DebtorCommonDialogComponent } from '../debtor-common-dialog/debtor-common-dialog.component';
import { DataService } from '../../services/data.service';
import { DebtcareApiService } from '../../services/debtcare-api.service';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';
import { format } from 'date-fns';
import { FormControl } from '@angular/forms';
import { ExportFileService } from 'projects/marketingcare/src/app/marketing-manager/services/export-file.service';
import { DebtcareActionDialogEnum } from 'projects/shared-models-lib/src/lib/enums/debtcare-action-dialog-enum';
import { AgeAnalysisDetails } from '../shared/models/age-analyisi-details';
import { InformationTabEnum } from 'projects/shared-models-lib/src/lib/enums/debtcare-information-tab-enum';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { FileDownloadService } from '../../services/file-download.service';
import { ActivatedRoute } from '@angular/router';
import { DebtCareService } from '../../services/debtcare.service';
import { PersonEventEmailAuditComponent } from 'projects/claimcare/src/app/claim-manager/views/person-event-email-audit/person-event-email-audit.component';

export interface UserData {
  date: string,
  status: string,
  acknowledgement: string,
  customerNumber: string,
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
  policyId: number
}

@Component({
  selector: 'app-debtor-collections-details',
  templateUrl: './debtor-collections-details.component.html',
  styleUrls: ['./debtor-collections-details.component.css']
})
export class DebtorCollectionsDetailsComponent {
  userDetails: UserData | undefined;
  details: any | undefined;
  information: info[] = [];
  HeadingTabs: string[] = ['Personal Information', 'All Address', 'More Details'];
  ageAnalysisDetails: AgeAnalysisDetails = null;
  selectedTab: string = this.HeadingTabs[0];
  allAddressSubTabs: string[] = ['Personal'];
  allMoreDetailsSubTabs: string[] = ['Book'];
  selectedAllAddressSubTab: string = this.allAddressSubTabs[0];
  selectedMoreDetailsSubTab: string = this.allMoreDetailsSubTabs[0];
  informationTab = InformationTabEnum;
  allInformation: info[] = [];
  userInformations: any = {}
  actionLogs: any[] = [];
  isLogsLoading: boolean = false;
  isInfoLoading: boolean = false;
  updateStatusData: any = {};
  isNoInformation: boolean = false;
  canEditForUpdateStatus: boolean;
  canEditForInvoices: boolean;
  canEditSignDoc: boolean;
  canEditEmail: boolean;
  canEditSms: boolean;
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
  fromDate: Date | null = null;
  toDate: Date | null = null;

  selectedFromDate: Date | null = null;
  selectedToDate: Date | null = null;
  fromDateControl = new FormControl();
  toDateControl = new FormControl();
  filteredLogs: FilteredItem[] = [];
  isDateFilterSelected: boolean = false;
  nextLine: string = '\n'
  rowActionType = DebtcareActionDialogEnum.Email;

  constructor(
    public dialog: MatDialog, private dataService: DataService,
    private debtorApiService: DebtcareApiService, private excelService: ExportFileService, private elementRef: ElementRef,
    private readonly fileDownloadService: FileDownloadService,
    private route: ActivatedRoute, private dataTimeService: DebtCareService
  ) { }

  ngOnInit(): void {
    this.getData();
    this.setPermissionForUpdateStatus();
    this.setPermissionForInvoices();
    this.setPermissionForSignDoc();
    this.setPermissionForEmail();
    this.setPermissionForSms();
    this.populateDropdownOptions();
    this.filteredLogs = this.actionLogs;
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
  getData(): void {

    this.route.queryParams.subscribe(params => {
      if(params && params['data']){
        const data = params['data'];
        const details = JSON.parse(decodeURIComponent(data));
        this.details = details;
        this.getUserInformation(this.details.finpayeeId)
        this.getUserActionLogs(this.details.finpayeeId,this.details.policyId)
        this.getUpdateStatusDetails(this.details.finpayeeId,this.details.policyId)
        this.getAgeAnalysisDetails();
      }
    });

  }

  setPermissionForUpdateStatus(): void {
    this.canEditForUpdateStatus = true;

  }

  setPermissionForInvoices(): void {
    this.canEditForInvoices = true;

  }

  setPermissionForSignDoc(): void {
    this.canEditSignDoc = true;

  }

  setPermissionForEmail(): void {
    this.canEditEmail = true;

  }

  setPermissionForSms(): void {
    this.canEditSms = true;

  }

  getAgeAnalysisDetails(): void {
    this.ageAnalysisLoading = true;
    this.debtorApiService.getDebtAgeAnalysis(this.details.policyId).subscribe((res: any) => {
      if (res) {
        this.ageAnalysisLoading = false;
        if(res?.data.length > 0){
        this.ageAnalysisDetails = res?.data[0];
        }else{
         this.ageAnalysisDetails = null; 
        }
      }
    })
  }

  getUserInformation(id: any): void {
    this.isInfoLoading = true;
    this.debtorApiService.getDebtCareCollectionAgentInformation(id).subscribe((res: any) => {
      if (res && res['data'][0]) {
        this.userInformations = res['data'][0];
        this.allInformation = this.getInfo();
        this.isInfoLoading = false;
      }
    })

    if (Object.keys(this.userInformations).length === 0) {
      this.isNoInformation = true;
    } else {
      this.isNoInformation = false;
    }
  }

  getUserActionLogs(id: number, policyId: number): void {
    this.isLogsLoading = true;
    this.debtorApiService.getDebtCareCollectionAgentActionLogs(id,policyId).subscribe((res: any) => {
      if (res && res['data']) {
        this.actionLogs = res['data'].map((item: any) => ({ ...item, showShortDesciption: true }));
        this.isLogsLoading = false;
        this.populateDropdownOptions();
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

  getUpdateStatusDetails(finpayid: number, policyId: number): void {

    this.debtorApiService.getUpdateStatusDetails(finpayid,policyId).subscribe((res: any) => {

      if (res && res.data) {
        this.updateStatusData = res.data;
      }
    })
  }

  getMoreDetails(): info[] {
    return [
      {
        key: 'Matter Number',
        value: this.userInformations.matterNumber
      },
      {
        key: 'Book',
        value: this.userInformations.book
      },
      {
        key: 'Matter Type',
        value: this.userInformations.matterType
      }
    ]
  }

  openDialog(value: string, dialogWidth: string): void {
    this.dialog.open(DebtorCommonDialogComponent, {
      width: dialogWidth,
      data: {
        action: value,
        details: this.details,
        contactNumber: this.userInformations?.phone1,
        emailTo: this.userInformations?.emailTo,
        statusInfo: this.updateStatusData?.length > 0 ? this.updateStatusData : undefined
      }

    }).afterClosed().subscribe((res) => {
      if (res) {
        if (res.key == DebtcareActionDialogEnum[DebtcareActionDialogEnum.UpdateStatus]) {
          this.getUserActionLogs(this.details.finpayeeId,this.details.policyId)
          this.getUpdateStatusDetails(this.details.finpayeeId,this.details.policyId)
        }  else if (res.key == DataResponseEnum.Success) {
          this.getUserActionLogs(this.details.finpayeeId,this.details.policyId)
        }
      }
    });
  }

  addEmailActionLogs(email: any): void {
   const LogTitlenext="<br>";
  let recipientsCC = (email?.RecipientsCC && email?.RecipientsCC.length > 0) ? email?.RecipientsCC : null
  let recipientsBCC = (email?.RecipientsBCC && email?.RecipientsBCC.length > 0) ? email?.RecipientsBCC : null

    const payload = {
      FinPayeeId: this.details.finpayeeId,
      PolicyId: this.details.policyId,
      LogTitle: (`Email Sent - (Subject: ${email.Subject})\n\nTo: ${email.Recipients}\n`).toString()
      + (recipientsCC != null ? `CC: ${recipientsCC}\n`: ``).toString() 
      + (recipientsBCC != null ? `BCC: ${recipientsBCC}\n`: ``),
      Description: email.Body,
      AgentId: 0,
      AssignDate: (format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")).toString() + ".000Z",
      AssignTime: format(new Date(), "HH:mm"), 
      ActionType: DebtcareActionDialogEnum.Email
    }
    this.debtorApiService.addEmailActionLogs(payload).subscribe((res: any) => {
      if (res && res.data == DataResponseEnum.Success) {
        this.getUserActionLogs(this.details.finpayeeId,this.details.policyId)
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
    if (this.selectedTab == this.informationTab.AllAddress) {
      this.allInformation = this.getAllAddressDetails();
    } else if (this.selectedTab == this.informationTab.PersonalInformation) {
      this.allInformation = this.getInfo();
    } else if (this.selectedTab == this.informationTab.MoreDetails) {
      this.allInformation = this.getMoreDetails();
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
    const toDate = this.dataTimeService.setTimeInDateRange(new Date(this.toDateControl.value));
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
      if (item.logTitle.toLowerCase().includes(searchTerm.trim().toLowerCase())) {
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
    const actionLogs = this.filteredList.length > 0 ? this.filteredList : this.actionLogs
    this.exportAsXLSX(actionLogs);
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

    const toDateValue = this.dataTimeService.setTimeInDateRange(this.toDateControl.value)

    const fromMonth = fromDate.getMonth();
    const fromYear = fromDate.getFullYear();
    const toMonth = toDate.getMonth();
    const toYear = toDate.getFullYear();

    let filteredResults = this.actionLogs.filter(log => {
      const logDate = new Date(log.assignDate);
     if (isTodayFrom && isTodayTo) {
        return logDate.toDateString() === today.toDateString();
      } else {
        return logDate >= fromDate && logDate <= toDateValue;
      }
    });
   

    this.filteredLogs = filteredResults;
    this.toggleSearchInput();
    this.applyFilter();
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

  openEmailAuditDialog(id: number): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '80%';
    dialogConfig.maxHeight = '750px';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      itemType: 'DebtCare',
      itemId: id,
      rolePlayerId: this.details.finpayeeId
    };
    this.dialog.open(PersonEventEmailAuditComponent, dialogConfig);
  }

}



