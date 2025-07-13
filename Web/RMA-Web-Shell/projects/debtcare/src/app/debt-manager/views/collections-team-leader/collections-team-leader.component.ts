import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DebtorCommonDialogComponent } from '../debtor-common-dialog/debtor-common-dialog.component';
import { DebtcareApiService } from '../../services/debtcare-api.service';
import { DataService } from '../../services/data.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { DebtorTypeTabsEnum } from 'projects/shared-models-lib/src/lib/enums/debtor-type-tabs.enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DebtCareService } from '../../services/debtcare.service';
import { FileDownloadService } from '../../services/file-download.service';
import { format } from 'date-fns';
import { UserData } from 'projects/legalcare/src/app/legal-manager/models/shared/interfaces/userdata.modal';
import { ExportFileService } from 'projects/marketingcare/src/app/marketing-manager/services/export-file.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { dateRange } from '../debtor-collections/debtor-collections.component';
interface assign {
  userName: string
  id: string
  email: string
}

interface paginationParams {
  page: number,
  pageSize: number,
  orderBy: string,
  dateDetails: dateRange,
  sortDirection: string,
  search: string
}

interface collectionStatus {
    id: number,
    statusCategoryName: string,
    debtCollectionStatusCodeId: number,
    debtCollectionStatusCategoryId: number,
    logText: string,
    status: number,
    transferToDepartmentId: number
}

@Component({
  selector: 'app-collections-team-leader',
  templateUrl: './collections-team-leader.component.html',
  styleUrls: ['./collections-team-leader.component.css']
})
export class CollectionsTeamLeaderComponent implements AfterViewInit {
  @ViewChild('selectedAgent', { static: true }) selectedAgent: ElementRef<HTMLInputElement>;
  @ViewChild('updateStatus', { static: true }) updateStatus: ElementRef<HTMLInputElement>;

  displayedColumns: string[] = ['customerNumber','policyId','customerName', 'openingBalance', 'currentBalance', 'assignedOn', 'ptp', 'brokenPTP', 'lastChanged', 'lastStatus', 'last_changed_date_status', 'department', 'documentStatus', 'accountAge'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageSize: number = 5;
  page: number = 1;
  totalItems: number = 0;
  hasMoreData: boolean = true;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('paginator') pageEvent: any;
  selectedIndex: number = 0;
  typeTabs: DebtorTypeTabsEnum[] = [
    DebtorTypeTabsEnum.OverDue,
    DebtorTypeTabsEnum.OverDueForTeam,
    DebtorTypeTabsEnum.New,
    DebtorTypeTabsEnum.Ongoing,
    DebtorTypeTabsEnum.All,
  ];
  debtcareTabs = DebtorTypeTabsEnum;
  isAcknowledgeArr: boolean[] = [];
  isAcknowledge: boolean[] = [];
  selectedTab: string = DebtorTypeTabsEnum[DebtorTypeTabsEnum.OverDue];
  isLoading: boolean = false;
  assignLits: assign[] = [];
  selectedValue: number[] = [];
  isSpinner: boolean = false;
  apiParams: paginationParams | undefined;
  currentTabKey: string
  reAssignAgent: string = null;
  assignValues: string[] = [];
  searchFilter;
  originalData: any[] = [];
  statusValues: number = DebtorTypeTabsEnum.OverDue;
  selectedRow: any[] = [];
  isRowSelected: boolean = false;
  filteredAssignList: any[] = [];
  isDropdownDisabled: boolean = false;
  showConfirmationDialog: boolean = false;
  hasAccess: boolean = false;
  selectedAgentoption= [];
  defaultSelectedValue: string;
  checkedRecordList: boolean[] = [false];
  filterDetailsForm: FormGroup;
  showFilterBox: boolean = false;
  statusList: collectionStatus[] = [];
  selectedStatusoption = [];
  isDropdownOpen: boolean = false;
  selectedAgentId: number = 0;
  selectedStatusId: number = 0;
  paramKey: string = DebtorTypeTabsEnum[DebtorTypeTabsEnum.OverDue];
  fromDate: Date | null = null;
  toDate: Date | null = null;
  selectedPtpParameter: number;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private debtcareApiService: DebtcareApiService,
    private dataS: DataService,
    private toastr: ToastrManager,
    private fb: FormBuilder,
    private debtCareService: DebtCareService,
    private readonly fileDownloadService: FileDownloadService,
    private excelService: ExportFileService
  ) {
  }

  ngOnInit(): void {
    this.getDebtcareTeamLeaderDetails(DebtorTypeTabsEnum[DebtorTypeTabsEnum.OverDue], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
    this.getAgentList();
    this.checkPermissions();
    this.selectedAgentoption = [...this.assignLits];
    this.getDebtcareCollectionList();

  }

  checkPermissions(): void {
    this.hasAccess = userUtility.hasPermission('Debtor Listing for Team Leader'); 
  }

  getDebtcareTeamLeaderDetails(key: string, index: number, pageSize: number, dateValue: dateRange, assignedId: number, collectionStatusId: number, ptp: number = 0): void {
    this.isLoading = true;
    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      dateDetails: dateValue,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }

    this.debtcareApiService.getDebtcareCollectionsAgentDetails(key, this.apiParams,assignedId,collectionStatusId,ptp).subscribe((res: any) => {
      if (res && res['data'] != undefined) {
        this.dataSource = new MatTableDataSource(res['data']);
        this.totalItems = res.rowCount;
        this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
        this.dataSource.data.forEach((val: any, i: number) => {
          this.assignValues[i] = val.assignedName;
        })
        this.isLoading = false;
      }
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (!this.originalData) {
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
        dateDetails: { fromDate: '0', toDate: '0' }
      };
      this.debtcareApiService.getDebtcareCollectionsAgentDetails(this.currentTabKey, params).subscribe(
        (res: any) => {
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
        dateDetails: { fromDate: '0', toDate: '0' }
      };
      this.debtcareApiService.getDebtcareCollectionsAgentDetails(this.currentTabKey, params).subscribe(
        (res: any) => {
          if (res && res.data && res.data.length > 0) {
            this.isSpinner = false;
            this.showFilterBox = false;
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
  openDialog(): void {
    this.dialog.open(DebtorCommonDialogComponent, {
      data: {
        action: 'acknowledge'
      }
    }).afterClosed().subscribe((res) => {
      if (res) {
        if (res.status && res.status == 'confirm') {
          this.isAcknowledge[this.selectedIndex] = true;
        }
      }
    });
  }

  onSelectValue(e: Event, index: number): void {
    let eventTemp: any = e;
    this.selectedValue[index] = eventTemp
    this.selectedIndex = index;
    this.isAcknowledgeArr = [];
    this.isAcknowledgeArr[this.selectedIndex] = true;
  }

  showDetails(data: UserData): void {
    const serializedObject = encodeURIComponent(JSON.stringify(data));
    this.router.navigate(['debtcare/debtor-collections-details'], {queryParams: {data: serializedObject}})
  }
  getTabName(tab: number): string {
    switch (tab) {
      case DebtorTypeTabsEnum.OverDue:
        return DebtorTypeTabsEnum[`${tab}`];
      case DebtorTypeTabsEnum.OverDueForTeam:
        return DebtorTypeTabsEnum[`${tab}`];
      case DebtorTypeTabsEnum.Ongoing:
        return DebtorTypeTabsEnum[`${tab}`];
      case DebtorTypeTabsEnum.New:
        return DebtorTypeTabsEnum[`${tab}`];
      case DebtorTypeTabsEnum.All:
        return DebtorTypeTabsEnum[`${tab}`];
      default:
        return '';
    }
  }
  onSelectTab(item: DebtorTypeTabsEnum): void {
    this.selectedTab = DebtorTypeTabsEnum[`${item}`];
    this.statusValues = item;
    this.currentTabKey = DebtorTypeTabsEnum[`${item}`];
    this.paramKey = DebtorTypeTabsEnum[`${item}`];
    switch (item) {
      case DebtorTypeTabsEnum.OverDue: {
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        this.getDebtcareTeamLeaderDetails(DebtorTypeTabsEnum[`${item}`], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
        this.displayedColumns = ['customerNumber','policyId', 'customerName', 'openingBalance', 'currentBalance', 'assignedOn', 'ptp', 'brokenPTP', 'lastChanged', 'lastStatus', 'last_changed_date_status', 'department', 'documentStatus', 'accountAge'];
        break;
      }
      case DebtorTypeTabsEnum.OverDueForTeam: {
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        this.getDebtcareTeamLeaderDetails(DebtorTypeTabsEnum[`${item}`], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
        this.displayedColumns = ['customerNumber','policyId', 'customerName', 'openingBalance', 'currentBalance', 'assignedOn', 'ptp', 'brokenPTP', 'lastChanged', 'lastStatus', 'department','documentStatus', 'accountAge', 'nextAction', 'overDueBy', 'reAssignAgent'];
        break;
      }
      case DebtorTypeTabsEnum.New: {
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        this.getDebtcareTeamLeaderDetails(DebtorTypeTabsEnum[`${item}`], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
        this.displayedColumns = ['customerNumber','policyId', 'customerName', 'openingBalance', 'currentBalance', 'assignedOn', 'ptp', 'brokenPTP', 'lastChanged', 'lastStatus', 'department', 'accountAge', 'nextAction', 'overDueBy', 'reAssignAgent'];
        break;
      }
      case DebtorTypeTabsEnum.Ongoing: {
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        this.getDebtcareTeamLeaderDetails(DebtorTypeTabsEnum[`${item}`], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
        this.displayedColumns = ['customerNumber','policyId', 'customerName', 'openingBalance', 'currentBalance', 'assignedOn', 'ptp', 'brokenPTP', 'lastChanged', 'lastStatus', 'department', 'accountAge', 'nextAction', 'overDueBy', 'reAssignAgent'];
        break;
      }
      case DebtorTypeTabsEnum.All: {
        this.page = 1;
        this.pageSize = 5;
        this.getDebtcareTeamLeaderDetails(DebtorTypeTabsEnum[`${item}`], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
        this.displayedColumns = ['customerNumber','policyId', 'customerName', 'openingBalance', 'currentBalance', 'assignedOn', 'ptp', 'brokenPTP', 'lastChanged', 'lastStatus', 'department','documentStatus', 'accountAge','nextAction', 'overDueBy', 'reAssignAgent'];
        break;
      }
    }
  }

  getAgentList(): void {
    this.debtcareApiService.getAssignAgentList().subscribe((res: any) => {
      if (res) {
        this.assignLits = res['data'];
          this.selectedAgentoption = [{userName: "All", id: 0},...this.assignLits]
      }
    })
  }

  onReAssignAgent(item: any, data: any): void {
    this.isSpinner = true;
    let payload = {
      FinPayeeId: data.finpayeeId,
      PolicyId: data.policyId,
      AssignedId: item.id,
      AssignedCollectionAgentEmail: item.email,
      PTPCount: data.ptp == null ? 0 : data.ptp,
    }

    this.debtcareApiService.reAssignAgent(payload).subscribe((res: any) => {
      if (res && res.data == '1') {
        this.isSpinner = false;
        this.toastr.successToastr('Re-Assigned Agent Successfully');
        this.getDebtcareTeamLeaderDetails(this.paramKey, this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
      } else {
        this.toastr.errorToastr('Failed to Re-Assign an Agent');
        this.isSpinner = false;
        this.reAssignAgent = null;
      }
    })
  }
  onMultipleReAssignAgent(item: any, data: any): void {
    const dialogRef = this.dialog.open(DebtorCommonDialogComponent, {
      data: {
        action: 'acknowledge',
        title: 'Confirmation',
        message: 'Are you sure you want to reassign?',
        isDialogDisabled: false,
      },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.isSpinner = true;
        const payload = {
          FinPayeeIds: this.selectedRow.map((row) => row.finpayeeId).join(','),
          ManagementTransactionIds: this.selectedRow.map((row) => row.managementTransactionId).join(','),
          AssignedId: item.id,
          AssignedCollectionAgentEmail: item.email,
        };

        this.debtcareApiService.multipleReAssignAgent(payload).subscribe(
          (res: any) => {
            if (res && res.data == '1') {
              this.isSpinner = false;
              this.toastr.successToastr('Re-Assigned Agent Successfully');
              this.selectedRow = [];
              this.updateDropdownList();
              this.isRowSelected = false;
              this.getDebtcareTeamLeaderDetails(this.paramKey, this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
            } else {
              this.toastr.errorToastr('Failed to Re-Assign an Agent');
              this.isSpinner = false;
              this.reAssignAgent = null;
            }
          }
        );
      }
    });
  }

  handlePageinatorEvent(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getDebtcareTeamLeaderDetails(this.paramKey, e.pageIndex, e.pageSize,{fromDate: '0', toDate: '0'},0,0);
  }
  onRowSelect(row: any) {
    const index = this.selectedRow.indexOf(row);
    if (index === -1) {
      this.selectedRow.push(row);
    } else {
      this.selectedRow.splice(index, 1);
    }
    this.updateDropdownList();
    this.isRowSelected = this.selectedRow.length > 0;

  }

  onSelectAll(e: Event): void{
  
      this.dataSource.data.map((item,i) =>{
        this.checkedRecordList[i] = e['checked'] 
        this.onRowSelectValue(e['checked'],i) 
      })
      if(!e['checked']){
        this.isRowSelected = false
      }
  }

  onRowSelectValue(checkeStatus: boolean, index: number) {
    const row = this.dataSource.data[index];
    if (checkeStatus) {
      this.selectedRow.push(row);
    } else {
      this.selectedRow.splice(index, 1);
    }
    this.updateDropdownList();
    this.isRowSelected = this.selectedRow.length > 0;

  }

  onDropdownSelect(option: string) {
  }
  isSelected(row: any): boolean {
    return this.selectedRow.includes(row);
  }
  filterAssignList(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredAssignList = this.assignLits.slice();
    } else {
      this.filteredAssignList = this.assignLits.filter(item =>
        item.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  updateDropdownList(): void {
    this.filteredAssignList = this.assignLits.filter(item => !this.selectedRow.includes(item));
    this.isDropdownDisabled = this.selectedRow.length > 0;

  }
  selectAllRows(event: MatCheckboxChange) {
    if (event.checked) {
        this.dataSource.data.forEach(row => {
            if (!this.selectedRow.includes(row)) {
                this.selectedRow.push(row);
            }
        });
    } else {
        this.selectedRow.length = 0; 
    }
    this.selectedRow = [...this.selectedRow]; 
    this.updateDropdownList();
    this.isRowSelected = this.selectedRow.length > 0;
}
searchValueAgent(searchText: string): void {
  if (searchText.length > 0) {
    const filterValue = searchText.toLowerCase();
    this.selectedAgentoption = this.assignLits.filter(o => o.userName.toLowerCase().includes(filterValue));
  } else {
    this.selectedAgentoption = [...this.assignLits];
  }
}

openFilterBox(): void{
  this.showFilterBox = !this.showFilterBox;
}

closeBox(): void{
  this.showFilterBox = false;
}

getfilterDetailsForm(): void{
  this.filterDetailsForm = this.fb.group({
    fromDate:[null],
    toDate:[null],
    collectionStatus: ['All'],
    agent: ['All'],
    brokenPTP: ['0']
  })
}

searchValueStatus(searchText: string): void {
  if (searchText.length > 0 && this.statusList) {
    const filterValue = searchText.toLowerCase();
    this.selectedStatusoption = this.statusList.filter(o => o.statusCategoryName.toLowerCase().includes(filterValue));
  } else {
    this.selectedStatusoption = [...this.statusList || []];
  }
}


getDebtcareCollectionList(): void{
  this.debtCareService.getStatusList('0').subscribe(res => {
    if (res && res.data) {
      this.statusList = res.data;
      this.selectedStatusoption = [{statusCategoryName: "All", id: 0},...this.statusList]
    } else {
      this.statusList = [];
      this.selectedStatusoption = [];
    }
    this.getfilterDetailsForm();
  })
}

onSelectCollectionStatus(id: number){
  this.selectedStatusId = id
}

selectAnAgent(id: number): void{
  this.selectedAgentId = id
}

resetFilters():void{
  this.selectedAgentId = 0;
  this.selectedStatusId = 0;
  this.getfilterDetailsForm();
}

applyFilterOnData(): void{
  const fromDataValue = this.filterDetailsForm.value.fromDate != null ? format(new Date(this.filterDetailsForm.value.fromDate),'yyyyMMdd') : '0'
  const toDataValue = this.filterDetailsForm.value.toDate != null ? format(new Date(this.filterDetailsForm.value.toDate),'yyyyMMdd') : '0'
    const dateParam = {
      fromDate: fromDataValue,
      toDate: toDataValue
    }
    this.getDebtcareTeamLeaderDetails(this.paramKey, this.page, this.pageSize, dateParam, this.selectedAgentId,this.selectedStatusId, this.selectedPtpParameter);
    this.showFilterBox = false;

}

exportToPdf(): void {
  const data = (this.dataSource.data && this.dataSource.data?.length > 0) ? this.dataSource.data : [];
  const formattedData = data.map((item) => {
    return {
      'Customer Number': item.customerNumber,
      'Customer Name': item.customerName,
      'Opening Balance': item.openingBalance,
      'Current Balance': item.currentBalance,
      'Assigned On': format(new Date(item.modifiedDate),'yyyy-MM-dd'), 
      'PTP': item.ptp.toString(),
      'Last Changed': item.lastChanged != null ? item.lastChanged : "-",
      'Last Status': item.lastStatus,
      'Last Changed by Agent': item.modifiedBy,
      'Department': item.transferedToDepartment != null ?  item.transferedToDepartment :"-",
      'Document Status': item.documentStatus,
      'Account Age': `${item.accountAge} Days`,
      'Next Action': item?.nextActionDate ? item?.nextActionDate : "-"
    }
  })
  let currentTime = format(new Date(),'yyMMddHHmmss');
  this.fileDownloadService.exportToPdf({data:formattedData,documentName: `debtcare_teamleaderdetails_${currentTime}.pdf`,fontSize: 6});
}

downloadList(): void{

  this.isSpinner = true;
    this.apiParams = {
      page: this.page,
      pageSize: this.totalItems,
      dateDetails: { fromDate: '0', toDate: '0' },
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }

    this.debtcareApiService.getDebtcareCollectionsAgentDetails(this.paramKey, this.apiParams,0,0).subscribe((res: any) => {
      if (res && res['data'] != undefined) {
        this.isSpinner = false;
        this.exportAsXLSX(res.data)
      }
    })

}

exportAsXLSX(excelJsonData: UserData[]): void {
  this.excelService.exportAsExcelFile(excelJsonData, "Debtcare_TeamLeaderReport");
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

onSelectBrokenPTP(key: number): void{
  this.selectedPtpParameter = key;
}

}


