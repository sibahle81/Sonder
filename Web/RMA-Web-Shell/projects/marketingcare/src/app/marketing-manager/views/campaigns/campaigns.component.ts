import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MarketingcareApiService } from '../../services/marketingcare-api.service';
import { CommonDialogueComponent } from '../common-dialogue/common-dialogue.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrManager } from 'ng6-toastr-notifications';
import { FormGroup } from '@angular/forms';
import { DataService } from 'projects/marketingcare/src/app/marketing-manager/services/data.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { EncryptionUtility } from 'projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility';


interface paginationParams {
  page: number,
  pageSize: number,
  orderBy: string
  sortDirection: string,
  search: string
}
@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.css']
})
export class CampaignsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['campaignName', 'campaignType', 'channels', 'createdDate', 'status', 'assign', 'acknowledgement'];
  dataSource: MatTableDataSource<any>= new MatTableDataSource<any>();
  pageSizeOptions: number[] = [5, 10, 20, 50]; 
  pageSize: number = 5;
  page: number = 1;
  totalItems: number = 0;
  hasMoreData: boolean = true;
  currentTabKey: string = 'All';
  originalData: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('paginatorPageSize') paginatorPageSize: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  selectedIndex: number = 0;
  selectedTab: string = 'All'
  typeTabs: string[] = ['All', 'Ongoing', 'Upcoming'];
  isLoading: boolean = false;
  dataSourceWithPageSize: any | undefined;
  campaignDetails: any = []
  apiParams: paginationParams | undefined;
  isSpinner: boolean = false;
  createCampaignForm!: FormGroup;
  loggedUser: any = {};
  canEdit: boolean;

  constructor(
    private router: Router,
    private marketingApiService: MarketingcareApiService,
    public dialog: MatDialog,
    private readonly toastr: ToastrManager,
    private marketingDataService: DataService
  ) { }


  ngOnInit(): void {
    this.getCampaignDetails('All');
    this.setPermission();
    this.loggedUser = JSON.parse(EncryptionUtility.decryptData(sessionStorage.getItem('auth-profile')));
  }

  getCampaignDetails(value: string): void {

    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }
    this.isLoading = true;
    this.marketingApiService.getCampaignList(value, this.apiParams).subscribe((res: any) => {
      try {
        if (res && res['data']) {

          this.campaignDetails = res['data']
          this.dataSource = new MatTableDataSource(this.campaignDetails)
          this.isLoading = false;
          this.totalItems = res.rowCount;
          this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
        } else {
          this.isLoading = false;
        }
      } catch (err) {
        this.isLoading = false;

      }
    })
  }

  setPermission(): void {
    this.canEdit = userUtility.hasPermission('Edit Campaign');

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  onSelectTab(item: string): void {
    this.selectedTab = item;
    switch (this.selectedTab) {
      case 'All': {
        this.getCampaignDetails('All');
        this.currentTabKey = 'All';
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
      case 'Ongoing': {
        this.getCampaignDetails('OnGoing');
        this.currentTabKey = 'OnGoing';
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
      case 'Upcoming': {
        this.getCampaignDetails('Upcoming');
        this.currentTabKey = 'Upcoming';
        this.page = 1;
        this.pageSize = 5;
        this.dataSource.filter = '';
        break;
      }
    }
  }

  createCampaign(): void {
    this.marketingDataService.setCampaignDetails({}, 'create');
    this.router.navigate(['marketingcare/create-campaign'])
  }

  showDetails(data: any): void {

  }

  applyFilter(e: Event): void {
    const filterValue = (e.target as HTMLInputElement).value.trim().toLowerCase();

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

      this.marketingApiService.getCampaignList(this.selectedTab,params).subscribe((res: any) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.campaignDetails = res.data;
          this.dataSource = new MatTableDataSource(this.campaignDetails);
          if (this.paginator) {
            this.paginator.length = res.rowCount;
            this.paginator.pageIndex = this.page - 1;
            this.paginator.pageSize = this.pageSize;
          }
        }else {
          this.isSpinner = false;

          this.dataSource = new MatTableDataSource([]);
        }
      },
        (error) => {
          this.isSpinner = false;
        }
      );
    }  else {
      this.isSpinner = true;
  
      const params = {
        page: this.page,
        pageSize: this.pageSize,
        orderBy: "StartDateAndTime",
        sortDirection: "asc",
        search: "0",
      };
      this.marketingApiService.getCampaignList(this.selectedTab,params).subscribe((res: any) => {
        this.isSpinner = false;
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.campaignDetails = res.data;
          this.dataSource = new MatTableDataSource(this.campaignDetails);
          if (this.paginator) {
            this.paginator.length = res.rowCount;
            this.paginator.pageIndex = this.page - 1;
            this.paginator.pageSize = this.pageSize;
          }
        }else {
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

  handlePageinatorEventCampaign(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getCampaignDetails(this.currentTabKey);
  }


  openDialog(value: string, id: number, entity: string): void {
    this.dialog.open(CommonDialogueComponent, {
      data: {
        action: value,
        entity: entity,
      }
    }).afterClosed().subscribe((res) => {
      if (res) {

        if (res.key == 'confirm') {

          this.onDeletCampaign(id)
        }
      }
    });
  }

  onDeletCampaign(id: number): void {
    this.isSpinner = true;
    this.marketingApiService.deleteCampaign(id).subscribe((res: any) => {
      if (res && res.data && res.data == '1') {
        this.toastr.successToastr('Campaign has been deleted successfully.', '', true);
        this.isSpinner = false;
        this.getCampaignDetails(this.currentTabKey);
      }else {
        this.toastr.errorToastr(res.message);
        this.isSpinner = false;
      }
    })
  }

  editCampaign(item: any, key: string): void {

    this.marketingDataService.setCampaignDetails(item, key);
    this.router.navigate(['marketingcare/create-campaign'])
  }


}

