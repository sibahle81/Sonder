
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
import { UploadInvoiceStatus } from 'projects/shared-models-lib/src/lib/enums/upload-invoice-status-enum';
import { LegalActionDialogEnum } from 'projects/shared-models-lib/src/lib/enums/legal-dialog-action-name-enum';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { takeUntil } from 'rxjs/operators';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import * as saveAs from 'file-saver';

export interface UserData {
  id: string,
  invoiceFile: string,
  date: string,
  amount: string,
  uploadedBy: string,
  claimNumber: string,
  policyNumber: string,
  customerName: string,
  status: string,
  isDeleted: string,
  createdBy: string,
  createdDate: string,
  modifiedBy: string,
  modifiedDate: string
}



interface assign {
  name: string;
}

@Component({
  selector: 'app-recovery-legal-head',
  templateUrl: './recovery-legal-head.component.html',
  styleUrls: ['./recovery-legal-head.component.css']
})
export class RecoveryLegalHeadComponent extends UnSubscribe implements OnInit, AfterViewInit {
  
  displayedColumns = [ 'claimNumber', 'policyNumber','customerName','invoiceFile', 'date', 'amount','uploadedBy','status','action']
  dataSource: MatTableDataSource<UserData> = new MatTableDataSource<UserData>();
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
    LegalTypeTabsEnum.Approved,
    LegalTypeTabsEnum.Rejected,
  ];
  isAcknowledgeArr: boolean[] = [];
  isAcknowledge: boolean[] = [];
  legalHeadDetails: any[] = [];
  newList: UserData[] = [];
  approvedList: UserData[] = [];
  rejectedList: UserData[] = [];
  selectedTab: string = LegalTypeTabsEnum[LegalTypeTabsEnum.Pending];
  statusValues: number = LegalTypeTabsEnum.Pending;
  isSpinner: boolean = false;
  currentTabKey: string = LegalTypeTabsEnum[LegalTypeTabsEnum.New];

  assign: assign[] = [];


  selectedValue: number[] = [];
  isLoading: boolean = false;
  apiParams: any = {};
  isUpdateSpinner: boolean = false;
  originalData: any[] = [];

  constructor(public dialog: MatDialog, private router: Router,
    private readonly toastr: ToastrManager,
    private dataService: DataService, private apiService: LegalApiService,
    private readonly documentManagementService: DocumentManagementService)
    {
      super();
    }

  ngOnInit(): void {
    this.isLoading = true;
    this.getLegalHeadDetails(this.selectedTab, this.page);
  }

  getLegalHeadDetails(Key: string, pageIndex: number): void {
    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }
    this.isLoading = true;
    this.apiService.fetchLegalHeadDetails(Key,this.apiParams).subscribe((res: any) =>{
      if(res && res['data'] != undefined){
        this.legalHeadDetails=res['data'] ? res['data'] : undefined
        this.totalItems = res.rowCount; 
        this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
        this.isLoading = false;
        this.dataSource = new MatTableDataSource(this.legalHeadDetails);
      }
    });
  }

  ngAfterViewInit(): void {
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

      this.apiService.fetchLegalHeadDetails(this.selectedTab, params).subscribe((res) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.legalHeadDetails = res['data']

          this.dataSource = new MatTableDataSource(this.legalHeadDetails);
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
        search:  "0",
      };

      this.apiService.fetchLegalHeadDetails(this.selectedTab, params).subscribe((res) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.legalHeadDetails = res['data']

          this.dataSource = new MatTableDataSource(this.legalHeadDetails);
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

  getInvoiceStatusText(status: number): string {
    switch (status) {
      case UploadInvoiceStatus.Pending:
        return UploadInvoiceStatus[`${status}`];
      case UploadInvoiceStatus.Approved:
        return UploadInvoiceStatus[`${status}`];
      case UploadInvoiceStatus.Rejected:
        return UploadInvoiceStatus[`${status}`];

      default:
        return 'Unknown Status';
    }
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

  onSelectValue(e: Event, index: number): void {
    let eventTemp: any = e;

    this.selectedValue[index] = eventTemp
    this.selectedIndex = index;
    this.isAcknowledgeArr = [];
    this.isAcknowledgeArr[this.selectedIndex] = true;

  }

  showDetails(data: UserData): void {
    this.dataService.setData(data)
  }
  getTabName(tab: number): string {
    switch (tab) {
      case LegalTypeTabsEnum.New:
        return LegalTypeTabsEnum[`${tab}`];
      case LegalTypeTabsEnum.Approved:
        return LegalTypeTabsEnum[`${tab}`];
      case LegalTypeTabsEnum.Rejected:
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
        this.currentTabKey = LegalTypeTabsEnum[`${item}`]
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        this.getLegalHeadDetails(LegalTypeTabsEnum[LegalTypeTabsEnum.Pending], this.page)
        this.selectedTab = LegalTypeTabsEnum[LegalTypeTabsEnum.Pending];
        this.displayedColumns = [ 'claimNumber', 'policyNumber','customerName','invoiceFile', 'date', 'amount','uploadedBy','status','action']
        break;
      }
      case LegalTypeTabsEnum.Approved: {
        this.isLoading = true;
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.getLegalHeadDetails(LegalTypeTabsEnum[`${item}`], this.page)
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        this.displayedColumns = [ 'claimNumber', 'policyNumber','customerName', 'invoiceFile', 'date', 'amount','uploadedBy','status']
        break;
      }
      case LegalTypeTabsEnum.Rejected: {
        this.isLoading = true;
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.getLegalHeadDetails(LegalTypeTabsEnum[`${item}`], this.page)
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        this.displayedColumns = [ 'claimNumber', 'policyNumber','customerName','invoiceFile', 'date', 'amount','uploadedBy','status']
        break;
      }
    }
  }

  onSelectStatusAction(statusAction: string, data: any): void {
    let temp = data;
    let statusId = UploadInvoiceStatus.Pending;
    if (statusAction == UploadInvoiceStatus[UploadInvoiceStatus.Approved]) {
      statusId = UploadInvoiceStatus.Approved;
    }
    else if (statusAction == UploadInvoiceStatus[UploadInvoiceStatus.Rejected]) {
      statusId = UploadInvoiceStatus.Rejected;
    }
    else {
      statusId = UploadInvoiceStatus.Pending;
    }
    this.dialog.open(CommonDailogComponent, {
      data: {
        action: LegalActionDialogEnum[LegalActionDialogEnum.ApproveOrReject],
        statusAction: statusAction
      }
    }).afterClosed().subscribe((val: any) => {
      if (val && val.status && val.status == 'confirm') {
        this.isSpinner = true;
        this.apiService.updateLegalCareReRecoveryStatus(temp.id, statusId.toString()).subscribe((res: any) => {
          try {
            if (res && res.data && res.data == '1') {
              this.isSpinner = false;
              this.toastr.successToastr(`${statusAction} Successfully.`, '', true);
              this.apiService.fetchLegalHeadDetails('Pending', this.apiParams).subscribe((res: any) => {
                if (res) {
                  this.isLoading = false;
                  this.dataSource = new MatTableDataSource(res['data']);
                }
              });
            } else {
              this.isSpinner = false;
              this.toastr.errorToastr(res.message, '', true);
            }
          } catch (err) {
          }
        })
      }
    })

  }

  handlePageinatorEventLegalRecoveryHead(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getLegalHeadDetails(this.selectedTab, e.pageIndex);
  }

  downloadDocument(id: number) {
    this.isSpinner = true;
    this.documentManagementService.GetDocumentBinary(id).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
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

}





