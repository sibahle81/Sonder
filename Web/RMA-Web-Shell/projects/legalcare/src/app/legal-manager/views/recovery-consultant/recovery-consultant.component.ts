import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { LegalApiService } from '../services/legal-api.service';
import { CommonDailogComponent } from '../common-dailog/common-dailog.component';
import { LegalTypeTabsEnum } from 'projects/shared-models-lib/src/lib/enums/legal-type-tabs.enum';


export interface UserData {
  referralId: string,
  claimNumber: string,
  policyNumber: string,
  customerName: string,
  date: string,
  status: string,
  assignId: string,
  isDeleted: string,
  createdBy: string,
  createdDate: string,
  modifiedBy: string,
  modifiedDate: string
}

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
  selector: 'app-recovery-consultant',
  templateUrl: './recovery-consultant.component.html',
  styleUrls: ['./recovery-consultant.component.css']
})
export class RecoveryConsultantComponent implements AfterViewInit {
  displayedColumns: string[] = ['claimNumber', 'policyNumber', 'customerName', 'date', 'status', 'acknowlegement'];
  dataSource: MatTableDataSource<UserData> = new MatTableDataSource<UserData>();

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

  selectedTab: string = LegalTypeTabsEnum[LegalTypeTabsEnum.New];;

  statusValues: number = LegalTypeTabsEnum.Open;

  assign: assign[] = [];


  selectedValue: number[] = [];
  isLoading: boolean = false;

  apiParams: paginationParams | undefined;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageSize: number = 5;
  page: number = 1;
  totalItems: number = 0;
  hasMoreData: boolean = true;
  currentTabKey: string = 'Pending';
  isSpinner: boolean = false;
  searchFilter;
  originalData: any[] = [];

  constructor(public dialog: MatDialog, private router: Router, private dataS: DataService,
    private apiS: LegalApiService) {
  }

  pageLength = 100;
  pageChangeEvent(event: any): void { }


  ngOnInit() {
    this.fetchDetails('Pending');
  }

  fetchDetails(key: string): void {
    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }
    this.isLoading = true;
    this.apiS.fetchLegalHeadDetails(key, this.apiParams).subscribe((res: any) => {
      if (res) {
        this.dataSource = new MatTableDataSource(res['data']);
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
      this.apiS.fetchLegalHeadDetails(this.currentTabKey, params).subscribe((res: any) => {

        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.searchFilter = res.data;
          this.dataSource.data = this.searchFilter;
          this.paginator.length = res.rowCount;
          this.paginator.pageIndex = this.page - 1;
          this.paginator.pageSize = this.pageSize;
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
      this.apiS.fetchLegalHeadDetails(this.currentTabKey, params).subscribe((res: any) => {

        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.searchFilter = res.data;
          this.dataSource.data = this.searchFilter;
          this.paginator.length = res.rowCount;
          this.paginator.pageIndex = this.page - 1;
          this.paginator.pageSize = this.pageSize;
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


  rowData(data: UserData): void {

  }

  openDialog(data: any, index: number): void {
    this.dialog.open(CommonDailogComponent, {
      data: {
        action: 'acknowledge'
      }
    }).afterClosed().subscribe((res) => {
      if (res) {
        if (res.status && res.status == 'confirm') {
          this.apiS.updateRecoveryAckStatus(data.refferalId).subscribe((res: any) => {
            try {
              if (res) {

              } else {

              }
            }
            catch (err) {

            }
          })
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
    this.router.navigate(['legalcare/legal-admin-details'], {queryParams: {data: serializedObject}})
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
    switch (item) {
      case LegalTypeTabsEnum.New: {
        this.statusValues = item;
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.fetchDetails(LegalTypeTabsEnum[`${item}`]);
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
      case LegalTypeTabsEnum.Approved: {
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.fetchDetails(LegalTypeTabsEnum[`${item}`]);
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
      case LegalTypeTabsEnum.Rejected: {
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.fetchDetails(LegalTypeTabsEnum[`${item}`]);
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
    }
  }
  handlePageinatorEventRecoveryConullant(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.fetchDetails(this.currentTabKey);
  }


}










