import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DebtorCommonDialogComponent } from '../debtor-common-dialog/debtor-common-dialog.component';
import { DebtcareApiService } from '../../services/debtcare-api.service';
import { DataService } from '../../services/data.service';
import { ActionDialogComponent } from '../action-dialog/action-dialog.component';
import { DebtorTypeTabsEnum } from 'projects/shared-models-lib/src/lib/enums/debtor-type-tabs.enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DebtCareService } from '../../services/debtcare.service';
import { format } from 'date-fns';
import { FileDownloadService } from '../../services/file-download.service';
import { UserData } from 'projects/legalcare/src/app/legal-manager/models/shared/interfaces/userdata.modal';
import { ExportFileService } from 'projects/marketingcare/src/app/marketing-manager/services/export-file.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ToastrManager } from 'ng6-toastr-notifications';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';

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

export interface dateRange{
  fromDate: string,
  toDate: string
}

@Component({
  selector: 'app-debtor-collections',
  templateUrl: './debtor-collections.component.html',
  styleUrls: ['./debtor-collections.component.css']
})
export class DebtorCollectionsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('paginator') pageEvent: any;
  displayedColumns: string[] = ['customerNumber','policyId','customerName', 'book', 'openingBalance', 'currentBalance', 'ptp', 'brokenPTP', 'assignedOn', 'nextActionDate', 'lastChanged', 'lastStatus', 'accountAge', 'overDueBy'];
  dataSource: MatTableDataSource<UserData> = new MatTableDataSource<UserData>();
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageSize: number = 5;
  page: number = 1;
  totalItems: number = 0;
  hasMoreData: boolean = true;
  selectedIndex: number = 0;
  typeTabs: DebtorTypeTabsEnum[] = [
    DebtorTypeTabsEnum.OverDue,
    DebtorTypeTabsEnum.New,
    DebtorTypeTabsEnum.Ongoing,
    DebtorTypeTabsEnum.All,
  ];
  isAcknowledgeArr: boolean[] = [];
  canEdit: boolean;
  isAcknowledge: boolean[] = [];
  selectedTab: string = DebtorTypeTabsEnum[DebtorTypeTabsEnum.OverDue];
  statusValues: number = DebtorTypeTabsEnum.Open;
  selectedValue: number[] = [];
  isLoading: boolean = false;
  apiParams: paginationParams | undefined;
  isSpinner: boolean = false;
  searchFilter;
  originalData: any[] = [];
  pageLength = 100;
  currentTabKey: string;
  showFilterBox: boolean = false;
  filterDetailsForm: FormGroup;
  statusList: collectionStatus[] = [];
  selectedStatusoption = [];
  formSubmitted: boolean = false;
  selectedAgentId: number = 0; 
  selectedStatusId: number = 0;
  selectedAgentoption = [];
  assignLits: assign[] = [];
  paramKey: string = DebtorTypeTabsEnum[DebtorTypeTabsEnum.OverDue];
  fromDate: Date | null = null;
  toDate: Date | null = null;
  selectedPtpParameter: number;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private debtCareApiService: DebtcareApiService,
    private dataService: DataService,
    private fb: FormBuilder,
    private debtCareService: DebtCareService,
    private readonly fileDownloadService: FileDownloadService,
    private excelService: ExportFileService,
    private toastr: ToastrManager,
  ) { }

  ngOnInit(): void {
    this.getDebtorCollections(DebtorTypeTabsEnum[DebtorTypeTabsEnum.OverDue], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
    this.getAgentList();
    this.setPermission();
    this.getDebtcareCollectionList();
  }

  getDebtorCollections(key: string, pageIndex: number, pageSize: number,dateValue: dateRange, assignId:number, statusId: number, ptp: number = 0): void {
    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      dateDetails: dateValue,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }
    this.isLoading = true;
    this.debtCareApiService.getDebtcareCollectionsAgentDetails(key, this.apiParams,assignId,statusId,ptp).subscribe((res: any) => {
      if (res && res['data'] != undefined) {
        this.dataSource = new MatTableDataSource(res['data']);
        this.totalItems = res.rowCount;
        this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
        this.isLoading = false;
      } else {
      }
    })
  }

  getAgentList(): void {
    this.debtCareApiService.getAssignAgentList().subscribe((res: any) => {
      if (res) {
        this.assignLits = res['data'];
        this.selectedAgentoption = [{userName: "All", id: 0},...this.assignLits]
      }
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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
        dateDetails: { fromDate: '0', toDate: '0' }
      };
      this.debtCareApiService.getDebtcareCollectionsAgentDetails(this.paramKey, params).subscribe((res: any) => {
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
      this.debtCareApiService.getDebtcareCollectionsAgentDetails(this.paramKey, params).subscribe((res: any) => {
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

  setPermission(): void {
    this.canEdit = true;
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

  showDetails(data: any): void {
    localStorage.setItem('selectedItem', JSON.stringify(data))
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
    this.paramKey = DebtorTypeTabsEnum[`${item}`];
    this.statusValues = item;
    this.currentTabKey = DebtorTypeTabsEnum[`${item}`];
    switch (item) {
      case DebtorTypeTabsEnum.OverDue: {
        this.getDebtorCollections(DebtorTypeTabsEnum[`${item}`], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
        this.displayedColumns = ['customerNumber','policyId', 'customerName', 'book', 'openingBalance', 'currentBalance', 'ptp', 'brokenPTP', 'assignedOn', 'nextActionDate', 'lastChanged', 'lastStatus', 'accountAge', 'overDueBy'];
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
      case DebtorTypeTabsEnum.New: {
        this.getDebtorCollections(DebtorTypeTabsEnum[`${item}`], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
        this.displayedColumns = ['customerNumber','policyId', 'customerName', 'book', 'openingBalance', 'currentBalance', 'ptp', 'brokenPTP', 'assignedOn', 'nextActionDate', 'lastChanged', 'lastStatus', 'accountAge', 'overDueBy'];
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
      case DebtorTypeTabsEnum.Ongoing: {
        this.getDebtorCollections(DebtorTypeTabsEnum[`${item}`], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
        this.displayedColumns = ['customerNumber','policyId', 'customerName', 'book', 'openingBalance', 'currentBalance', 'ptp', 'brokenPTP', 'assignedOn', 'nextActionDate', 'lastChanged', 'lastStatus', 'accountAge', 'overDueBy'];
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
      case DebtorTypeTabsEnum.All: {
        this.getDebtorCollections(DebtorTypeTabsEnum[`${item}`], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
        this.displayedColumns = ['customerNumber','policyId','customerName', 'book', 'openingBalance', 'currentBalance', 'ptp', 'brokenPTP', 'assignedOn', 'nextActionDate', 'lastChanged', 'lastStatus', 'department', 'documentStatus', 'accountAge', 'overDueBy'];
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
    }
  }

  handlePageinatorEvent(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getDebtorCollections(this.paramKey, e.pageIndex, e.pageSize,{fromDate: '0', toDate: '0'},0,0);
  }

  onDebtcareJob(): void {
    this.isSpinner = true;
    this.debtCareApiService.DebtCareInvoiceTransactionJob().subscribe((res: any) => {
      if (res && res.data == '1') {
        this.isSpinner = false;
        this.openActionDialog('show_message', res, '30vw')
      } else {
      }
    })
  }

  updateBrokenPTP(): void{
    this.isSpinner = true;
    this.debtCareApiService.debtcareUpdateBrokenPTP().subscribe((res: any) => {
      if(res){
        this.isSpinner = false;
        if(res.data == DataResponseEnum.Success){
          this.toastr.successToastr(res.message, '', true);
          this.getDebtorCollections(DebtorTypeTabsEnum[DebtorTypeTabsEnum.OverDue], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
        }else{
          this.toastr.errorToastr(res.message, '', true)
          this.getDebtorCollections(DebtorTypeTabsEnum[DebtorTypeTabsEnum.OverDue], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
        }
      }
    })
  }

  openActionDialog(action: string, data: any, dialogWidth: string): void {
    this.dialog.open(ActionDialogComponent, {
      width: dialogWidth,
      data: {
        action: action,
        dialogData: data
      }
    }).afterClosed().subscribe((res: any) => {
      if (res && res.key == 'closeDebtcareJob') {
        this.getDebtorCollections(DebtorTypeTabsEnum[DebtorTypeTabsEnum.OverDue], this.page, this.pageSize,{fromDate: '0', toDate: '0'},0,0);
       }
    })
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

  openFilterBox(): void{
    this.showFilterBox = !this.showFilterBox;
  }
  
  closeBox(): void{
    this.showFilterBox = false;
  }
  
  getfilterDetailsForm(): void{
    this.filterDetailsForm = this.fb.group({
      fromDate: [null],
      toDate: [null],
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

  searchValueAgent(searchText: string): void {
    if (searchText.length > 0) {
      const filterValue = searchText.toLowerCase();
      this.selectedAgentoption = this.assignLits.filter(o => o.userName.toLowerCase().includes(filterValue));
    } else {
      this.selectedAgentoption = [...this.assignLits];
    }
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
      this.getDebtorCollections(this.paramKey, this.page, this.pageSize,dateParam,this.selectedAgentId,this.selectedStatusId, this.selectedPtpParameter);
      this.showFilterBox = false;
  }

  onSelectCollectionStatus(id: number){
    this.selectedStatusId = id
  }
  
  selectAnAgent(id: number): void{
    this.selectedAgentId = id
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
    this.fileDownloadService.exportToPdf({data:formattedData,documentName: `debtcare_collectiondetails_${currentTime}.pdf`,fontSize: 6});
  }

  downloadList(): void{
     this.isSpinner = true;
      const params = {
        page: this.page,
        pageSize: this.totalItems,
        orderBy: "StartDateAndTime",
        sortDirection: "asc",
        search: "0",
        dateDetails: { fromDate: '0', toDate: '0' }
    };
    this.debtCareApiService.getDebtcareCollectionsAgentDetails(this.paramKey, params).subscribe((res: any) => {
      if (res && res.data && res.data.length > 0) {
         this.isSpinner = false;
         this.exportAsXLSX(res.data)
      }
    })
  }

  exportAsXLSX(excelJsonData: UserData[]): void {
    this.excelService.exportAsExcelFile(excelJsonData, "Debtcare_CollectionReport");
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
