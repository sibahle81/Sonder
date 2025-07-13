import { Component } from '@angular/core';
import { OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MarketingcareApiService } from '../../services/marketingcare-api.service';
import { MatTableDataSource } from '@angular/material/table';
import { MarketingCareService } from '../../services/marketingcare.service';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonDialogueComponent } from '../common-dialogue/common-dialogue.component';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MarketingApprovalStatusEnum } from 'projects/shared-models-lib/src/lib/enums/campaign-action.enum';
import { FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
export interface UserData {
  claimNumber: string,
  policyNumber: string,
  customerName: string,
  createdDate: string,
  date: string,
  status: string, 
  acknowledgement: string
}
interface assign {
  name: string;
}

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit, AfterViewInit {
  title = 'group_landing2';

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageSize: number = 5;
  page: number = 1;
  totalItems: number = 0;
  hasMoreData: boolean = true;
  groupListForFilter;
  statusArr: MarketingApprovalStatusEnum
  canEdit: boolean;

   displayedColumns: string[] = ['groupName', 'date&time', 'status', 'actions'];
  
   @ViewChild(MatPaginator) paginator: MatPaginator;
   @ViewChild(MatSort) sort!: MatSort;
 
   selectedIndex: number = 0;
   typeTabs: string[] = ['New','Pending','Ongoing','Closed'];
   isAcknowledgeArr: boolean[] = [];
   isAcknowledge: boolean[] = [];
   isSpinner: boolean = false
   selectedTab: string = 'New';
   statusValues: string = 'Open';
   assign: assign[] = []
   selectedValue: number[] = [];
   legalDetails: Object[] = [];
   originalData: any[] = [];
   groupDetails: any = []
   isLoading: boolean = false;
  apiParams: { page: any; pageSize: number; orderBy: string; sortDirection: string; search: string; };
  statusKey: any;
 
   constructor(
    public dialog: MatDialog, 
    private router: Router, 
    private marketingApiService: MarketingcareApiService, 
    private service: MarketingCareService, 
    private toastr: ToastrManager) {
   }

  search = new FormControl()

  openDialog(value: string, id: number, entity: string): void {
    this.dialog.open(CommonDialogueComponent, {
      data: {
        action: value,
        entity: entity
      }
    }).afterClosed().subscribe((res) => {
      if (res) {
        if(res.key == 'confirm'){
          this.deleteGroup(id)
        }
      }
    });
  }

  pageLength = 100;

  pageChangeEvent(event: any): void { }

  getUserDetails(): void { }

  ngOnInit() {
    this.getGroupList();
    this.getGroupList();
    this.setPermission();

    this.search.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      switchMap((filterValue) => {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          orderBy: "StartDateAndTime",
          sortDirection: "asc",
          search: filterValue || "0",
        }
        this.isSpinner = true
        return this.marketingApiService.getMarketingCaregroupList(params)
      })).subscribe((res) => {
        if (res && res.data) {
          this.isSpinner = false;
          this.groupListForFilter = res.data
          this.dataSource = new MatTableDataSource(this.groupListForFilter);
          this.paginator.length = res.rowCount;
          this.paginator.pageIndex = this.page - 1;
          this.paginator.pageSize = this.pageSize;
        }
      })
  }

  getGroupList(): void {
    this.dataSource = new MatTableDataSource(this.groupDetails);
    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }
    this.isLoading = true;
    this.marketingApiService.getMarketingCaregroupList(this.apiParams).subscribe((res: any) => {

      if (res) {
        this.groupDetails = res['data'] ? res['data'] : undefined

        this.dataSource = new MatTableDataSource(this.groupDetails)
        this.totalItems = res.rowCount;
        this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
        this.isLoading = false;
      } else {

      }
    })
  }
  setPermission(): void {
    this.canEdit = userUtility.hasPermission('Edit Group');

  }
  getStatus(enumObj: MarketingApprovalStatusEnum): string {

    switch (enumObj) {
      case MarketingApprovalStatusEnum.Pending:
        return 'Pending'

      case MarketingApprovalStatusEnum.Onhold:
        return 'Onhold'

      case MarketingApprovalStatusEnum.Rejected:
        return 'Rejected'

      case MarketingApprovalStatusEnum.Approved:
        return 'Approved'
    }

  }

  handlePageinatorGetGroupList(e: PageEvent): void {

    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getGroupList()

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
  
      this.marketingApiService.getMarketingCaregroupList(params).subscribe((res: any) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.groupDetails = res.data;
          this.dataSource = new MatTableDataSource(this.groupDetails);
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
      });
    } else {
      this.isSpinner = true;
  
      const params = {
        page: this.page,
        pageSize: this.pageSize,
        orderBy: "StartDateAndTime",
        sortDirection: "asc",
        search: "0",
      };
  
      this.marketingApiService.getMarketingCaregroupList(params).subscribe((res: any) => {
        this.isSpinner = false;
        
        if (res && res.data && res.data.length > 0) {
          this.groupDetails = res.data;
          this.dataSource = new MatTableDataSource(this.groupDetails);
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
  
  rowData(data: UserData): void {

  }

  editGroup(data) {

    this.service.setGroupUpdateData(data)
    this.router.navigate(['/marketingcare/create-groups'])
  }

  deleteGroup(id: number) {
    this.isSpinner = true
    this.marketingApiService.deleteMarketingCareGroup(id.toString()).subscribe((res) => {
      if (res && res.data == '1') {
        this.toastr.successToastr('Group has been deleted successfully.', '', true);
      }else {
        this.toastr.errorToastr(res.message);
        this.isSpinner = false;
      }
      this.isSpinner = false
      this.getGroupList();
    })
  }

  onSelectValue(e: Event, index: number): void {
    let eventTemp: any = e;

    this.selectedValue[index] = eventTemp
    this.selectedIndex = index;
    this.isAcknowledgeArr = [];
    this.isAcknowledgeArr[this.selectedIndex] = true;

  }

  createGroup(): void {
    const data = null
    this.router.navigate(['marketingcare/create-groups'])
    this.service.setGroupUpdateData(data);

  }
}



