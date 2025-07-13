import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
  acknowledgementStatus: string,
  advisorId: string,
  createdBy: string,
  createdDate: string,
  customerName: string,
  dateOfObjection: string,
  id: string,
  isDeleted: string,
  modifiedBy: string,
  modifiedDate: string,
  objectionDocument: string,
  objectionId: string,
  status: string
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
  selector: 'app-tribunal-legal-advisor',
  templateUrl: './tribunal-legal-advisor.component.html',
  styleUrls: ['./tribunal-legal-advisor.component.css']
})
export class TribunalLegalAdvisorComponent implements AfterViewInit {
  displayedColumns: string[] = ['customerName', 'dateOfObjection', 'supporting_docs'];

  dataSource: MatTableDataSource<UserData> = new MatTableDataSource<UserData>();
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageSize: number = 5;
  page: number = 1;
  totalItems: number = 0;
  hasMoreData: boolean = true;
  isSpinner: boolean = false;

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

  assign: assign[] = [];


  selectedValue: number[] = [];

  responseData: any = []

  legalDetails: any[] = [];

  apiParams: paginationParams | undefined;
  isRPILoading: boolean = false;
  searchFilter;
  originalData: any[] = [];
  currentTabKey: string = LegalTypeTabsEnum[LegalTypeTabsEnum.New];
  isLoading: boolean = false;

  constructor(public dialog: MatDialog, private router: Router,
    private dataS: DataService, private apiSerivice: LegalApiService) {


  }

  pageLength = 100;
  pageChangeEvent(event: any): void { }

  getUserDetails(): void {
  }

  ngOnInit() {
    this.getTribunalAdvisor(this.selectedTab, this.page)
  }
  getTribunalAdvisor(statusKey: string, pageIndex: number): void {
    this.isRPILoading = true;

    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }
    this.isLoading = true;
    this.apiSerivice.getLegalTribunalDetails(statusKey, this.apiParams).subscribe((res: any) => {
      if (res && res['data'] != undefined) {

        this.legalDetails = res['data']

        this.dataSource = new MatTableDataSource(res['data']);
        this.totalItems = res.rowCount;

        this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
        this.isRPILoading = false;
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

      this.apiSerivice.getLegalTribunalDetails(this.selectedTab, this.apiParams).subscribe((res: any) => {
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
        search: filterValue || "0",
      };

      this.apiSerivice.getLegalTribunalDetails(this.selectedTab, this.apiParams).subscribe((res: any) => {
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
        }
  }

  rowData(data: UserData): void {

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
    this.selectedTab = LegalTypeTabsEnum[`{item}`];
    this.statusValues = item;
    switch (item) {
      case LegalTypeTabsEnum.New: {
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.getTribunalAdvisor(LegalTypeTabsEnum[LegalTypeTabsEnum.Open], this.page);
        this.selectedTab = LegalTypeTabsEnum[LegalTypeTabsEnum.Open];

        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';

        break;
      }
      case LegalTypeTabsEnum.Ongoing: {
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.getTribunalAdvisor(LegalTypeTabsEnum[`${item}`], this.page);
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
      case LegalTypeTabsEnum.Closed: {
        this.currentTabKey = LegalTypeTabsEnum[`${item}`];
        this.getTribunalAdvisor(LegalTypeTabsEnum[`${item}`], this.page);
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
    }
  }

  handlePageinatorEventTribunalLegalAdvisor(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getTribunalAdvisor(this.selectedTab, e.pageIndex);
  }
}






