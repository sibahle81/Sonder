import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MarketingcareApiService } from '../../services/marketingcare-api.service';
import { Router } from '@angular/router';
import { CommonDialogueComponent } from '../common-dialogue/common-dialogue.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MarketingCareService } from '../../services/marketingcare.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { MatSort } from '@angular/material/sort';

interface paginationParams {
  page: number,
  pageSize: number,
  orderBy: string
  sortDirection: string,
  search: string
}
export interface CampaignType {
  createdBy: string,
  createdDate: string,
  id: number,
  isDeleted: boolean,
  modifiedBy: string,
  modifiedDate: string,
  name: string,
  status: string,
}
@Component({
  selector: 'app-campaign-type',
  templateUrl: './campaign-type.component.html',
  styleUrls: ['./campaign-type.component.css']
})

export class CampaignTypeComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('paginatorPageSize') paginatorPageSize: MatPaginator;
  isSpinner: boolean = false;
  isLoading: boolean = false;
  displayedColumns: string[] = ['campaignName', 'approvers', 'finalApprover', 'action'];
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageSize: number = 5;
  page: number = 1;
  totalItems: number = 0;
  hasMoreData: boolean = true;
  apiParams: paginationParams | undefined;
  campaignTypeDetails: any = []
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  originalData: any[] = [];
  canEdit: boolean;

  constructor(private service: MarketingCareService, private readonly toastr: ToastrManager,
    public dialog: MatDialog, private apiS: MarketingcareApiService, private router: Router) { }
  ngOnInit(): void {
    this.getCampaignType();
    this.setPermission();
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

      this.apiS.getCampaignTypeList(params).subscribe((res: any) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.campaignTypeDetails = res.data;
          this.dataSource = new MatTableDataSource(this.campaignTypeDetails);
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
      this.apiS.getCampaignTypeList(params).subscribe((res: any) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.campaignTypeDetails = res.data;
          this.dataSource = new MatTableDataSource(this.campaignTypeDetails);
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
  setPermission(): void {
    this.canEdit = userUtility.hasPermission('Edit Campaign Type');
  }
  handlePageinatorEventCampaignType(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getCampaignType();
  }
  showDetails(data: any): void {

  }
  getCampaignType(): void {
    this.dataSource = new MatTableDataSource(this.campaignTypeDetails);

    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }
    this.isLoading = true
    this.apiS.getCampaignTypeList(this.apiParams).subscribe((res: any) => {
      if (res && res['data']) {
        this.campaignTypeDetails = res['data']

        this.dataSource = new MatTableDataSource(this.campaignTypeDetails);
        this.totalItems = res.rowCount;
        this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
        this.isLoading = false;

      }
    });
  }
  createCampaign(): void {
    const data = null
    this.router.navigate(['marketingcare/create-campaign-type-new'])
    this.service.setGroupUpdateData(data);
  }
  onEditType(id: number) {
    this.router.navigate(['/marketingcare/edit-campaign-type', id]);
  }

  deleteType(id: number): void {
    this.apiS.deleteCampignType(id).subscribe((res: any) => {

      if (res && res.data == '1') {
        ;
        this.toastr.successToastr('Campign Deleted  successfully.', '', true);
        this.isSpinner = false;
      } else {
        this.toastr.errorToastr(res.message);
        this.isSpinner = false;
      }
      this.getCampaignType();
    })
  }
  openDialog(value: string, id: number, entity: string): void {
    this.dialog.open(CommonDialogueComponent, {
      data: {
        action: value,
        entity: entity
      }
    }).afterClosed().subscribe((res) => {
      this.isSpinner = false;
      if (res) {
        this.isSpinner = false;

        if (res.key == 'confirm') {
          this.isSpinner = true;
          this.deleteType(id)
        }
      }
    });
  }
  editType(data) {

    this.service.setGroupUpdateData(data)
    this.router.navigate(['marketingcare/create-campaign-type-new'])
  }
}
