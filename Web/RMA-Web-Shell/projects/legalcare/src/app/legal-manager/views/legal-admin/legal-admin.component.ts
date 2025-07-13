
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
import { FormBuilder, FormGroup } from '@angular/forms';
import { LegalCareReferralStatus } from 'projects/shared-models-lib/src/lib/enums/legal-recovery-status.enum';
import { LegalTypeTabsEnum } from 'projects/shared-models-lib/src/lib/enums/legal-type-tabs.enum';
import { AccessRolesEnum } from 'projects/shared-models-lib/src/lib/enums/accress-roles-enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { format } from 'date-fns';
import { FileDownloadService } from 'projects/debtcare/src/app/debt-manager/services/file-download.service';
import { UserData } from '../../models/shared/interfaces/userdata.modal';
import { ExportFileService } from 'projects/marketingcare/src/app/marketing-manager/services/export-file.service';
import { EncryptionUtility } from 'projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility';
interface assign {
  displayName: string;
  email: string,
  userName: string,
  id: number
}

interface dataId {
  permissionGroupId: string,
  moduleId: string,
  permissionGroupName: string
}

interface paginationParams {
  page: number,
  pageSize: number,
  orderBy: string
  sortDirection: string,
  search: string
}
@Component({
  selector: 'app-legal-admin',
  templateUrl: './legal-admin.component.html',
  styleUrls: ['./legal-admin.component.css'],
})
export class LegalAdminComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['claimNumber', 'policyNumber', 'customerName', 'createdDate', 'status', 'assign', 'acknowledgement'];
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
    LegalTypeTabsEnum.Pending,
    LegalTypeTabsEnum.Ongoing,
    LegalTypeTabsEnum.Closed
  ];
  isAcknowledgeArr: boolean[] = [];
  isAssignNotSelf: boolean[] = [];
  isAcknowledge: boolean[] = [];
  initialTab: string = 'New';
  selectedTab: string = LegalTypeTabsEnum[LegalTypeTabsEnum.Open];
  statusValues: number = LegalTypeTabsEnum.Open;
  userDetails: any | undefined;
  assign: assign[] = [];
  selectedValue: number[] = [];
  legalDetails: any[] = [];
  isLoading: boolean = false;
  selected = 'select';
  dataIds: dataId | undefined;
  apiParams: paginationParams | undefined;
  currentTabKey: string = LegalTypeTabsEnum[LegalTypeTabsEnum.New];
  isUpdateSpinner: boolean = false;
  defaultValueText: string = "SELECT";
  userInfo: any;
  originalData: any[] = [];
  selectForm: FormGroup[]=[];
  isAckEnable: boolean[] = [false];
  isSpinner: boolean = false;
  loggedUser: string;
  hasAccess: boolean = false;
  statusKeyValue: string = LegalTypeTabsEnum[LegalTypeTabsEnum.New];
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private apiService: LegalApiService,
    private readonly toastr: ToastrManager,
    private fb: FormBuilder,
    private readonly fileDownloadService: FileDownloadService,
    private excelService: ExportFileService
  ) { }

  ngOnInit() {
    this.getRecoveryDetails(LegalTypeTabsEnum[`${this.statusKeyValue}`]);
    this.getUser();
    this.getLegalCareAccessRoles();
  }

  getFormDetails(): FormGroup {
    return this.fb.group({
      assignValue: [null],
    });
  }

  getStatusText(status: number): string {
    switch (status) {
      case LegalCareReferralStatus.Pending:
        return LegalCareReferralStatus[`${status}`];
      case LegalCareReferralStatus.Open:
        return LegalCareReferralStatus[`${status}`];
      case LegalCareReferralStatus.Ongoing:
        return LegalCareReferralStatus[`${status}`];
      case LegalCareReferralStatus.Closed:
        return LegalCareReferralStatus[`${status}`];
      default:
        return 'Unknown Status';
    }
  }

  getRecoveryDetails(statusKey: string): void {
    this.isLoading = true;
    this.isAcknowledgeArr = [];
    this.isAssignNotSelf = [];
    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }

    this.apiService.getLegalRecoveryDetails(statusKey, this.apiParams).subscribe((res: any) => {
      if (res && res['data'] != undefined) {
        this.legalDetails = res['data'] ? res['data'] : undefined;
        this.selectForm = this.legalDetails.map(() => this.getFormDetails()); // Initialize forms for each row
        this.dataSource.data = res.data;
        this.totalItems = res.rowCount;
        this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
        this.isLoading = false;
      } 
    });
  }

  getUser(): void {
    if (sessionStorage.getItem('auth-profile')) {
      this.userDetails = JSON.parse(EncryptionUtility.decryptData(sessionStorage.getItem('auth-profile')));
    }
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
      };
      this.apiService.getLegalRecoveryDetails(LegalTypeTabsEnum[`${this.statusKeyValue}`], params).subscribe((res) => {
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
        search: "0",
      };
      this.apiService.getLegalRecoveryDetails(LegalTypeTabsEnum[`${this.statusKeyValue}`], params).subscribe((res) => {
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

  openDialog(data: any, currentAction: string, index: number): void {
    this.dialog.open(CommonDailogComponent, {
      data: {
        action: 'acknowledge',
        data: data
      }
    })
      .afterClosed().subscribe((res) => {
        if (res) {
          if (res.status && res.status == 'confirm') {
            this.isSpinner = true;
            this.apiService.updateRecoveryAckStatus(data.referralId).subscribe((res: any) => {
              if (res) {
                this.isSpinner = false;
                this.toastr.successToastr('Acknowledged Successfully.', '', true);
                this.selectForm[index].get('assignValue').patchValue(null);

                this.isAcknowledge[index] = true;
                this.getRecoveryDetails(LegalTypeTabsEnum[`${this.statusKeyValue}`]);
              }
            })
          }
        }
      });
  }

  onSelectValue(item: any, data: any, index: number): void {
    this.onAssignAttorney(data, index, item);
  }

  onAssignAttorney(data: any, index: number, eventTemp: any): void {
    let payload = {
      ReferralId: data['referralId'],
      AssignAdvisorId: eventTemp.id,
      LegalSubModuleAlias: "R"
    }
    this.isSpinner = true;
    this.apiService.submitAssignAttorney(payload).subscribe((res: any) => {
      if (res) {
        this.toastr.successToastr('Successfully Assigned', '', true);
        this.isAckEnable[index] = data.id == this.userDetails.sub ? true : false
        this.selectedValue[index] = eventTemp.email
        this.selectedIndex = index;
        this.isAcknowledgeArr = [];
        this.getRecoveryDetails(LegalTypeTabsEnum[`${this.statusKeyValue}`]);

        if (this.userDetails.email == eventTemp.email) {
          this.isAcknowledgeArr[index] = true;
        } else {
          this.isAcknowledgeArr[index] = false;
        }
        this.isAssignNotSelf[index] = false;
        this.isSpinner = false;
        this.selectForm[index].get('assignValue').patchValue(null); 
      }
    })
  }

  showDetails(data: UserData): void {
    let finalData = { ...data, ...this.dataIds }

    const details = {
      customerName: finalData.customerName,
      policyNumber: finalData.policyNumber,
      legalCareRefferalStatus: finalData.legalCareRefferalStatus,
      referralId: finalData.referralId
    }
    const serializedObject = encodeURIComponent(JSON.stringify(details));
    this.router.navigate(['legalcare/legal-admin-details'], {queryParams: {data: serializedObject}})
  }

  getTabName(tab: number): string {
    switch (tab) {
      case LegalTypeTabsEnum.New:
        return LegalTypeTabsEnum[`${tab}`];
      case LegalTypeTabsEnum.Pending:
        if (this.loggedUser === AccessRolesEnum[AccessRolesEnum.RecoveryConsultant]) {
          return 'Pending';
        } else {
          return LegalTypeTabsEnum[`${tab}`];
        } 
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
    switch(item) { 
      case LegalTypeTabsEnum.New: { 
        this.displayedColumns = ['claimNumber', 'policyNumber', 'customerName', 'createdDate', 'status', 'assign', 'acknowledgement']
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.page = 1;
        this.pageSize = 5;
        this.getRecoveryDetails(LegalTypeTabsEnum[LegalTypeTabsEnum.Open]);
        this.selectedTab = LegalTypeTabsEnum[LegalTypeTabsEnum.Open];

        this.dataSource.filter = '';
        break; 
      } 
      case LegalTypeTabsEnum.Pending: { 
        this.displayedColumns = ['claimNumber', 'policyNumber', 'customerName', 'createdDate', 'status', 'acknowledgement']
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];

        this.page = 1;
        this.pageSize = 5;
        this.getRecoveryDetails(LegalTypeTabsEnum[`${item}`]);
        this.dataSource.filter = '';

        break;
      }
      case LegalTypeTabsEnum.Ongoing: {
        this.displayedColumns = ['claimNumber', 'policyNumber', 'customerName', 'aasignTo', 'createdDate', 'lastActionDate', 'status']
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];


        this.page = 1;
        this.pageSize = 5;
        this.getRecoveryDetails(LegalTypeTabsEnum[`${item}`]);
        this.dataSource.filter = '';

        break;
      }
      case LegalTypeTabsEnum.Closed: {
        this.displayedColumns = ['claimNumber', 'policyNumber', 'customerName', 'createdDate', 'status']
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];


        this.page = 1;
        this.pageSize = 5;
        this.getRecoveryDetails(LegalTypeTabsEnum[`${item}`]);
        this.dataSource.filter = '';

        break;
      }
    }
  }

  checkPermissions(): void {
    this.hasAccess = userUtility.hasPermission('Recovery Admin Listing'); 
    if(this.hasAccess){
      this.updateTypeTabs();
      this.onSelectTab(LegalTypeTabsEnum.Pending);
      this.getRecoveryDetails(LegalTypeTabsEnum[LegalTypeTabsEnum.Pending]);
    }
    if(!this.hasAccess) {
       this.updateTypeTabs();
    }
  }

  getLegalCareAccessRoles(): void {
    this.apiService.getLegalCareAccessRoles(this.userDetails.email).subscribe((res: any) => {
      if (res && res['data']) {
          this.dataIds = {
          permissionGroupId: res['data'][0].permissionGroupId.toString(),
          moduleId: res['data'][0].moduleId.toString(),
          permissionGroupName: res['data'][0].permissionGroupName.toString()
        }
        this.getAttorneyList(this.dataIds.moduleId, this.dataIds.permissionGroupId)
      }

    })
  }

  updateTypeTabs(): void {
    this.typeTabs = !this.hasAccess ? 
      [LegalTypeTabsEnum.Pending, LegalTypeTabsEnum.Ongoing, LegalTypeTabsEnum.Closed] :
      [LegalTypeTabsEnum.New, LegalTypeTabsEnum.Pending, LegalTypeTabsEnum.Ongoing, LegalTypeTabsEnum.Closed];
  }
  getAttorneyList(id: string, modId: string): void {
    this.assign = [];
    this.apiService.getAssignAttorneyList(id, modId).subscribe((res: any) => {
      if (res && res['data']) {
        this.assign = res['data'];
      }
    })
  }

  handlePageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getRecoveryDetails(LegalTypeTabsEnum[`${this.statusKeyValue}`]);
  }

  exportToPdf(): void {
    const data = (this.dataSource.data && this.dataSource.data?.length > 0) ? this.dataSource.data : [];
    if(data?.length > 0){
      let tableData = {};
      const formattedData = data.map((item) => {
      if(this.statusValues == LegalTypeTabsEnum.Ongoing){
          tableData = {
            'claim No.': item.claimNumber,
            'Policy No.': item.policyNumber,
            'Customer Name': item.customerName,
            'Assign To': item.assignedName,
            'Assign On': format(new Date(item.date),'yyyy-MM-dd'),
            'Lats Action Date': format(new Date(item.modifiedDate),'yyyy-MM-dd'),
            'Status': this.getStatusText(item.legalCareReferralStatus)
          }
          }else{
          tableData = {
            'claim No.': item.claimNumber,
            'Policy No.': item.policyNumber,
            'Customer Name': item.customerName,
            'Date': format(new Date(item.createdDate),'yyyy-MM-dd'),
            'Status': this.getStatusText(item.legalCareReferralStatus)
          }
        }
        return tableData;
      })
      let currentTime = format(new Date(),'yyMMddHHmmss');
      this.fileDownloadService.exportToPdf({data:formattedData,documentName: `Legal_recoverydetails_${currentTime}.pdf`,fontSize: 6});
    }
  }

  downloadList(): void {
      this.isSpinner = true;
      this.apiParams = {
        page: this.page,
        pageSize: this.totalItems,
        orderBy: "StartDateAndTime",
        sortDirection: "asc",
        search: "0"
      }
      this.apiService.getLegalRecoveryDetails(LegalTypeTabsEnum[`${this.statusKeyValue}`], this.apiParams).subscribe((res: any) => {
        if (res && res['data'] != undefined) {
          this.isSpinner = false;
          this.legalDetails = res['data'];
          this.exportAsXLSX(this.legalDetails);
        } 
      });
  }

  exportAsXLSX(excelJsonData: any): void {
    this.excelService.exportAsExcelFile(excelJsonData, "Legalcare_RecoveryAdminReport");
  }

}





