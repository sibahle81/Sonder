import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { LegalApiService } from '../services/legal-api.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { CommonDailogComponent } from '../common-dailog/common-dailog.component';
import { LegalTypeTabsEnum } from 'projects/shared-models-lib/src/lib/enums/legal-type-tabs.enum';
import { format } from 'date-fns';
import { FileDownloadService } from 'projects/debtcare/src/app/debt-manager/services/file-download.service';
import { UserData } from '../../models/shared/interfaces/userdata.modal';
import { ExportFileService } from 'projects/marketingcare/src/app/marketing-manager/services/export-file.service';
import { EncryptionUtility } from 'projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility';


interface assign {
  name: string;
}

interface paginationParams {
  page: number,
  pageSize: number,
  orderBy: string
  sortDirection: string,
  search: string
}

@Component({
  selector: 'app-tribunal-legal-secretary',
  templateUrl: './tribunal-legal-secretary.component.html',
  styleUrls: ['./tribunal-legal-secretary.component.css']
})
export class TribunalLegalSecretaryComponent implements AfterViewInit {

  displayedColumns: string[] = ['customerName', 'dateOfObjection', 'assign_legal_advisor', 'acknowledgementStatus', 'supportingDocs'];

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
  typeTabs: LegalTypeTabsEnum[] = [
    LegalTypeTabsEnum.New,
    LegalTypeTabsEnum.Ongoing,
    LegalTypeTabsEnum.Closed,
  ];
  isAcknowledgeArr: boolean[] = [];
  isAcknowledge: boolean[] = [];
  selectedTab: string = LegalTypeTabsEnum[LegalTypeTabsEnum.Open];
  statusValues: number = LegalTypeTabsEnum.Open;
  userAcknowledgementChoice: boolean = false;
  LegalCareAccessRoles: any
  attorneyList: any
  selectedValue: any[] = [];
  responseData: any = [];
  isAcknowledged = false;
  apiParams: paginationParams | undefined;
  legalDetails: any[] = [];
  assignedData: any;
  isLogsLoading = false
  isDownloadEnabled = false;
  currentTabKey: string = LegalTypeTabsEnum[LegalTypeTabsEnum.New];
  originalData: any[] = [];
  minDate = new Date();
  isLoading: boolean = false;
  isSpinner: boolean = false;
  isAssingnmentList: boolean[] = [false];
  selectedItem: any = {};
  userInfo: any | undefined = {};

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private readonly toastr: ToastrManager,
    private dataS: DataService,
    private apiService: LegalApiService,
    private readonly fileDownloadService: FileDownloadService,
    private excelService: ExportFileService
  ) { }

  ngOnInit(): void {
    this.getCurrentUserDetails();
    this.getTribunalLegalSecratry(LegalTypeTabsEnum[LegalTypeTabsEnum.Open])
  }

  getCurrentUserDetails(): void {
    if (sessionStorage.getItem('auth-profile')) {
      this.userInfo = JSON.parse(EncryptionUtility.decryptData(sessionStorage.getItem('auth-profile')));
    }
  }

  getTribunalLegalSecratry(statusKey: string): void {
    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }
    this.isLoading = true
    this.apiService.getLegalTribunalDetails(statusKey, this.apiParams).subscribe((res: any) => {
      if (res && res['data'] != undefined) {
        this.dataSource = new MatTableDataSource(res['data']);
        this.totalItems = res.rowCount;
        this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
        this.legalDetails = res['data']
        this.isLoading = false;
        if (this.userInfo.role == 'Tribunal Legal Advisor' || this.userInfo.role == 'Tribunal Legal Secretary') {
          this.patchValueForAdivisor();
        }
      }
    });
    this.getAccessRoles();
  }

  acknowledge(item: any) {
    this.selectedItem = item;
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

      this.apiService.getLegalTribunalDetails(LegalTypeTabsEnum[`${this.statusValues}`], params).subscribe((res) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.legalDetails = res['data']
          this.dataSource = new MatTableDataSource(this.legalDetails);
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
        search: filterValue || "0",
      };

      this.apiService.getLegalTribunalDetails(LegalTypeTabsEnum[`${this.statusValues}`], params).subscribe((res) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.legalDetails = res['data']
          this.dataSource = new MatTableDataSource(this.legalDetails);
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
        }
  }

  downloadSupportingDoc(): void{
  }

  getAccessRoles() {
    this.isLogsLoading = true;
    this.apiService.getLegalCareAccessRoles(this.userInfo?.email).subscribe((res: any) => {
      this.isLogsLoading = false;
      if (res) {
        this.LegalCareAccessRoles = res.data[0];
        if (this.LegalCareAccessRoles.moduleId && this.LegalCareAccessRoles.permissionGroupId) {
          this.getAttorneyList(this.LegalCareAccessRoles.moduleId, this.LegalCareAccessRoles.permissionGroupId)
        }
      }
    })
  }
  getAttorneyList(modId, perId) {
    this.isLogsLoading = true
    this.apiService.getLegalCareAttorneyList(modId, perId).subscribe((res: any) => {
      if (res) {
        this.isLogsLoading = false
        this.attorneyList = res.data
      }
    })
  }

  getAssignedAckAttrny(modId, perId) {
    this.isLogsLoading = true
    this.apiService.getAssignedAcknowledgeAttorney(modId, perId).subscribe((res: any) => {
      this.isLogsLoading = false
      if (res) {
        this.assignedData = res.data
      }
    })
  }

  assignedAdvisor(advisorId, record, index: number) {
    let advisorObj = {
      ReferralId: record.objectionId.toString(),
      AssignAdvisorId: advisorId.toString()
    }
    if (advisorObj.ReferralId && advisorObj.AssignAdvisorId) {
      this.isSpinner = true;
      this.apiService.AssignLegalCareTribunalAssignId(advisorObj).subscribe((res: any) => {

        if (res && res.data == '1') {
          this.toastr.successToastr('Advisor has been assigned successfully.', '', true);
          this.isSpinner = false;
          this.isAssingnmentList[index] = true;
        } else {
          this.toastr.errorToastr('Advisor assignment was unsuccessfully, please try again!');
          this.isSpinner = false;
          this.isAssingnmentList[index] = false;
        }
      })
    }

  }


  openDialog(record): void {
    this.dialog.open(CommonDailogComponent, {
      data: {
        action: 'acknowledge',
        details: record,
        LegalCareAccessRoles: this.LegalCareAccessRoles
      }
    }).afterClosed().subscribe((res) => {
      if (res) {
        if (res.status && res.status == 'confirm') {
          this.isAcknowledged = true;
          this.isAcknowledge[this.selectedIndex] = true;
          this.isDownloadEnabled = true;
          this.isSpinner = true;
          this.apiService.AckLegalCareTribunalId(this.selectedItem.objectionId.toString()).subscribe((res: any) => {
            if (res) {
              if (res && res.data == '1') {
                this.toastr.successToastr('Successfully Acknowledged and moved to Ongoing', '', true);
                this.isSpinner = false;
                this.getTribunalLegalSecratry('Open');

                this.isAssingnmentList = [false]
              } else {
                this.toastr.errorToastr('Failed to Acknowledge the Record, please try again!');
                this.isSpinner = false;
              }
            } else {
              this.toastr.errorToastr('Failed to Acknowledge the Record, please try again!');
              this.isSpinner = false;
            }
          })
        }
      }
    });
  }

  onSelectValue(e: Event, index: number): void {
    let eventTemp: any = e;
    this.selectedValue[index] = this.attorneyList[0].id;
    this.selectedIndex = index;
    this.isAcknowledgeArr = [];
    this.isAcknowledgeArr[this.selectedIndex] = true;
  }

  showDetails(data: UserData): void {
    localStorage.setItem('selectedItem', JSON.stringify(data))
    const serializedObject = encodeURIComponent(JSON.stringify(data));
    this.router.navigate(['legalcare/tribunal-legal-details'], {queryParams: {data: serializedObject}})
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
        this.isLogsLoading = true
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.getTribunalLegalSecratry(LegalTypeTabsEnum[LegalTypeTabsEnum.Open]);
        this.selectedTab = LegalTypeTabsEnum[LegalTypeTabsEnum.Open];
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
      case LegalTypeTabsEnum.Ongoing: {
        this.isLogsLoading = true
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.getTribunalLegalSecratry(LegalTypeTabsEnum[LegalTypeTabsEnum.Ongoing]);
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
      case LegalTypeTabsEnum.Closed: {
        this.isLogsLoading = true
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.getTribunalLegalSecratry(LegalTypeTabsEnum[LegalTypeTabsEnum.Closed]);
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
    }
  }

  handlePageinatorEventTribunalLeagalSecretary(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getTribunalLegalSecratry(this.selectedTab);
  }

  patchValueForAdivisor(): void {
    this.selectedValue = [];
    this.dataSource.data.map((res: any, i: number) => {
      this.selectedValue[i] = res.assignedAdvisorName;
    })
  }

  exportToPdf(): void {
    const data = (this.dataSource.data && this.dataSource.data?.length > 0) ? this.dataSource.data : [];
    if(data?.length > 0){
      let tableData = {};
      const formattedData = data.map((item) => {
        tableData = {
        'Customer Name': item.customerName,
        'Date Of Objection': format(new Date(item.dateOfObjection), 'yyyy-MM-dd'),
        'Assigned Legal Advisor': item.assignedAdvisorName != null ? item.assignedAdvisorName : '-',
        'Acknowledgement Status': item.isAcknowledge ? 'Acknowledged' : 'Unacknowledged'
        }
        return tableData;
      })
      let currentTime = format(new Date(),'yyMMddHHmmss');
      this.fileDownloadService.exportToPdf({data:formattedData,documentName: `Legal_Tribunaldetails_${currentTime}.pdf`,fontSize: 8});
    }
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
    this.apiService.getLegalTribunalDetails(LegalTypeTabsEnum[LegalTypeTabsEnum.New], this.apiParams).subscribe((res: any) => {
      if (res && res['data'] != undefined) {
        this.isSpinner = false;
        this.exportAsXLSX(res['data'])
      }
    });
  }

  exportAsXLSX(excelJsonData: any): void {
    this.excelService.exportAsExcelFile(excelJsonData, "sample");
  }

}


