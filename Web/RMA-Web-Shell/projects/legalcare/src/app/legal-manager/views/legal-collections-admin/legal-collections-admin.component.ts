import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { LegalApiService } from '../services/legal-api.service';
import { CommonDailogComponent } from '../common-dailog/common-dailog.component';
import { ToastrManager } from 'ng6-toastr-notifications';
import { LegalTypeTabsEnum } from 'projects/shared-models-lib/src/lib/enums/legal-type-tabs.enum';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';
import { FileDownloadService } from 'projects/debtcare/src/app/debt-manager/services/file-download.service';
import { format } from 'date-fns';
import { UserData } from '../../models/shared/interfaces/userdata.modal';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ExportFileService } from 'projects/marketingcare/src/app/marketing-manager/services/export-file.service';
import { EncryptionUtility } from 'projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility';
interface assign {
  displayName: string;
  email: string,
  userName: string,
  id: number,
  attorneyName: string
}

interface paginationParams {
  page: number,
  pageSize: number,
  orderBy: string
  sortDirection: string,
  search: string
}

interface dataId {
  permissionGroupId: string,
  moduleId: string,
  permissionGroupName: string
}

@Component({
  selector: 'app-legal-collections-admin',
  templateUrl: './legal-collections-admin.component.html',
  styleUrls: ['./legal-collections-admin.component.css']
})
export class LegalCollectionsAdminComponent implements AfterViewInit {

  displayedColumns: string[] = [
    'customerName',
    'policyNumber',
    'policyId',
    'status',
    'lastNoticeSentDate',
    'createdDate',
    'assign_attorney'
  ]

  dataSource: MatTableDataSource<UserData> = new MatTableDataSource<UserData>();
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageSize: number = 5;
  page: number = 1;
  totalItems: number = 0;
  hasMoreData: boolean = true;
  filteredData = []
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('paginator') pageEvent: any;
  @ViewChild(MatSort) sort!: MatSort;

  selectedIndex: number = 0;
  typeTabs: LegalTypeTabsEnum[] = [
    LegalTypeTabsEnum.New,
    LegalTypeTabsEnum.Ongoing,
    LegalTypeTabsEnum.Closed,
  ];
  isAcknowledgeArr: boolean[] = [];
  isAcknowledge: boolean[] = [];
  selectedTab: string = LegalTypeTabsEnum[LegalTypeTabsEnum.Open];
  statusValues: number = LegalTypeTabsEnum.Open;
  apiParams: paginationParams | undefined;
  isLoading: boolean = false;
  dataIds: dataId | undefined;
  assign: assign[] = []
  userDetails: any | undefined;
  currentTabKey: string = LegalTypeTabsEnum[LegalTypeTabsEnum.New];
  isSpinner: boolean = false;
  originalData: any[] = [];
  pageLength: number = 100;
  showFilterBox: boolean = false;
  filterDetailsForm: FormGroup;
  selectedAgentoption = [];
  assignLits: assign[] = [];
  selectedAttorneyId: number = 0;

  constructor(
    public dialog: MatDialog, 
    private router: Router,
    private dataS: DataService, 
    private apiS: LegalApiService,
    private readonly toastr: ToastrManager,
    private readonly fileDownloadService: FileDownloadService,
    private fb: FormBuilder,
    private excelService: ExportFileService
  ) {
  }

  ngOnInit(): void {
    this.getLegalCollectionsDetails(this.selectedTab, this.page);
    this.getAttorthisneyList();
  }

  getLegalCollectionsDetails(key: string, pageIndex: number): void {
    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }
    this.isLoading = true;
    this.apiS.fetchLegalRefferenceCollection(key, this.apiParams,this.selectedAttorneyId).subscribe((res: any) => {
      if (res && res['data'] != undefined) {
        this.dataSource = new MatTableDataSource(res['data']);
        this.totalItems = res.rowCount;
        this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
        this.isLoading = false;
      } 
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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

      this.apiS.fetchLegalRefferenceCollection(this.selectedTab, params).subscribe((res) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.filteredData = res['data']
          this.dataSource = new MatTableDataSource(this.filteredData);
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

      this.apiS.fetchLegalRefferenceCollection(this.selectedTab, params).subscribe((res) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.filteredData = res['data']
          this.dataSource = new MatTableDataSource(this.filteredData);
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
      );    }
  }

  openDialog(): void {
    this.dialog.open(CommonDailogComponent, {
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

  onSelectValue(item: any, data: any, index: number): void {
    this.onAssignAttorney(data, index, item)
  }

  onAssignAttorney(data: any, index: number, eventTemp: any): void {
    let payload = {
      Id:data['id'],
      FinPayeeId: data['finPayeeId'],
      AttorneyId: eventTemp.id,
    }

    this.isSpinner = true;
    this.apiS.submitAssignAttorneyCollection(payload).subscribe((res: any) => {
      if (res && res.data == DataResponseEnum.Success) {
        this.isSpinner = false;
        this.toastr.successToastr('Successfully Assigned', '', true);
        this.getLegalCollectionsDetails(this.selectedTab, index);
      }else {
        this.toastr.errorToastr(res.message, '', true);
        this.isSpinner = false;
      }
    })
  }

  getUser(): void {
    if (sessionStorage.getItem('auth-profile')) {
      this.userDetails = JSON.parse(EncryptionUtility.decryptData(sessionStorage.getItem('auth-profile')));
    }
  }

  showDetails(data: UserData): void {

    const serializedObject = encodeURIComponent(JSON.stringify(data));
    this.router.navigate(['legalcare/legal-collections-details'], {queryParams: {data: serializedObject}})
  }
  getTabName(tab: number): string {
    switch (tab) {
      case LegalTypeTabsEnum.New:
        return LegalTypeTabsEnum[`${tab}`];
      case LegalTypeTabsEnum.Ongoing:
        return LegalTypeTabsEnum[`${tab}`];
      case LegalTypeTabsEnum.Closed:
        return LegalTypeTabsEnum[`${tab}`];
      default:
        return '';
    }
  }
  onSelectTab(item: LegalTypeTabsEnum): void {
    this.selectedTab = LegalTypeTabsEnum[`${item}`];
    this.statusValues = item;

    switch (item) {
      case LegalTypeTabsEnum.New: {
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        this.getLegalCollectionsDetails(LegalTypeTabsEnum[LegalTypeTabsEnum.Open], this.page);
        this.selectedTab = LegalTypeTabsEnum[LegalTypeTabsEnum.Open];
        this.displayedColumns = [
          'customerName',
          'policyNumber',
          'policyId',
          'status',
          'lastNoticeSentDate',
          'createdDate',
          'assign_attorney'
        ]

        break;
      }
      case LegalTypeTabsEnum.Ongoing: {
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        this.getLegalCollectionsDetails(LegalTypeTabsEnum[`${item}`], this.page);
        this.displayedColumns = [
          'customerName',
          'policyNumber',
          'policyId',
          'status',
          'lastNoticeSentDate',
          'createdDate',
          'assign_attorney'
        ]
        break;
      }
      case LegalTypeTabsEnum.Closed: {
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        this.displayedColumns = [
          'customerName',
          'policyNumber',
          'policyId',
          'status',
          'lastNoticeSentDate',
          'createdDate'
        ]
        this.getLegalCollectionsDetails(LegalTypeTabsEnum[`${item}`], this.page);
        break;
      }
    }
  }

  getLegalCareAccessRoles(): void {
    this.apiS.getLegalCareAccessRoles('').subscribe((res: any) => {
      if (res && res['data']) {
        this.dataIds = {
          permissionGroupId: res['data'][0].permissionGroupId.toString(),
          moduleId: res['data'][0].moduleId.toString(),
          permissionGroupName: res['data'][0].permissionGroupName.toString()
        }
        this.getAttorthisneyList();
      }
    })
  }

  selectAnAgent(id: number):void{ 
    this.selectedAttorneyId = id;
  }

  getAttorthisneyList(): void {
    this.apiS.getCollectionsAttorneyList().subscribe((res: any) => {
      if (res && res['data']) {
        this.assign = res['data'];
        this.assignLits = [ { attorneyName: 'All', id: 0 } ,...res['data'] ];
        this.getfilterDetailsForm();
      }
    })
  }

  handlePageinatorEventCollectionAdmin(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getLegalCollectionsDetails(this.selectedTab, e.pageIndex);
  }

  exportToPdf(): void {
    const data = (this.dataSource.data && this.dataSource.data?.length > 0) ? this.dataSource.data : [];
    if(data?.length > 0){
      let tableData = {};
      const formattedData = data.map((item) => {
        tableData = {
        'Customer Name': item.customerName,
        'Status': item.declaredValue,
        'Last Notice SentDate': format(new Date(item.lastNoticeSentDate),'yyyy-MM-dd'),
        'Created On': format(new Date(item.createdDate),'yyyy-MM-dd')
        }
        return tableData;
      })
      let currentTime = format(new Date(),'yyMMddHHmmss');
      this.fileDownloadService.exportToPdf({data:formattedData,documentName: `Legal_collectiondetails_${currentTime}.pdf`,fontSize: 6});
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
      attorney: ['All']
    })
  }

  searchValueAgent(searchText: string): void {
    if (searchText.length > 0) {
      const filterValue = searchText.toLowerCase();
      this.assignLits = this.assign.filter(o => o.attorneyName.toLowerCase().includes(filterValue));
    } else {
      this.assignLits = [...this.assign];
    }
  }

  resetFilterForm(): void{
    this.filterDetailsForm.get('attorney').setValue('All');
    this.selectedAttorneyId = 0;
  }

  filterData(): void{
    this.getLegalCollectionsDetails(this.selectedTab, this.page);
    this.showFilterBox = false;
  }

  downloadList(): void {
      this.apiParams = {
        page: this.page,
        pageSize: this.totalItems,
        orderBy: "StartDateAndTime",
        sortDirection: "asc",
        search: "0"
      }
      this.isSpinner = true;
      this.apiS.fetchLegalRefferenceCollection(this.selectedTab, this.apiParams,this.selectedAttorneyId).subscribe((res: any) => {
        if (res && res['data'] != undefined) {
          this.exportAsXLSX(res['data']);
          this.isSpinner = false;
        } 
      });
  }

  exportAsXLSX(excelJsonData: any): void {
    this.excelService.exportAsExcelFile(excelJsonData, "Legalcare_CollectionAdminReport");
  }

}

