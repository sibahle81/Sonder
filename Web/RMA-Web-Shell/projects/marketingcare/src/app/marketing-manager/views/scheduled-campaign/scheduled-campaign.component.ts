import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MarketingCareService } from '../../services/marketingcare.service';
import { PDFDocument, rgb } from 'pdf-lib';
import { CommonDialogueComponent } from '../common-dialogue/common-dialogue.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MarketingcareApiService } from '../../services/marketingcare-api.service';
import { ExportFileService } from '../../services/export-file.service';
import { MarketingCampaignScheduleStatusEnum } from 'projects/shared-models-lib/src/lib/enums/campaign-schedule-status.enum';

interface paginationParams {
  page: number,
  pageSize: number,
  orderBy: string
  sortDirection: string,
  search: string
}
@Component({
  selector: 'app-scheduled-campaign',
  templateUrl: './scheduled-campaign.component.html',
  styleUrls: ['./scheduled-campaign.component.css']
})
export class ScheduledCampaignComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['campaignName', 'campaignType', 'channels', 'createdDate', 'status', 'action', 'assign'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageSize: number = 5;
  page: number = 1;
  totalItems: number = 0;
  hasMoreData: boolean = true;
  scheduledDetails = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  selectedIndex: number = 0;
  selectedTab: string = 'All'
  typeTabs: string[] = ['All', 'Ongoing', 'Upcoming'];
  isLoaderLoading = false;
  apiParams: paginationParams | undefined;
  isSpinner: boolean = false;
  originalData = [];


  constructor(private router: Router,
    private readonly toastr: ToastrManager,
    public dialog: MatDialog,
    private marketingCareService: MarketingCareService,
    private apimarketing: MarketingcareApiService,
    private excelService: ExportFileService
  ) { }


  ngOnInit(): void {
    this.getCampaignList();
  }

  getCampaignList() {
    this.dataSource = new MatTableDataSource(this.scheduledDetails);

    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: "StartDateAndTime",
      sortDirection: "asc",
      search: "0"
    }
    this.isLoaderLoading = true
    this.marketingCareService.getAllCampaigns(this.apiParams).subscribe(res => {
      this.isLoaderLoading = false
      if (res && res['data']) {
        this.scheduledDetails = res['data'] ? res['data'] : undefined

        this.dataSource = new MatTableDataSource(this.scheduledDetails);
        this.totalItems = res.rowCount;
        this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
      } 
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onSelectTab(item: string): void {
    this.selectedTab = item;
    switch (this.selectedTab) {
      case 'All': {

        break;
      }
      case 'Ongoing': {

        break;
      }
      case 'Upcoming': {

        break;
      }
    }
  }

  createSchedule(): void {
    this.router.navigate(['marketingcare/create-schedule'])
  }


  async downloadReport(row: any) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const headerY = page.getHeight() - 50;
    page.drawText('Campaign Name', { x: 50, y: headerY, size: 10, color: rgb(0, 0, 0) });
    page.drawText('Groups', { x: 50, y: headerY, size: 10, color: rgb(0, 0, 0) });
    page.drawText('Channels', { x: 50, y: headerY, size: 10, color: rgb(0, 0, 0) });
    page.drawText('Scheduled Start Date & Time', { x: 50, y: headerY, size: 10, color: rgb(0, 0, 0) });
    page.drawText('Approval Status', { x: 50, y: headerY, size: 10, color: rgb(0, 0, 0) });

    const dataY = headerY - 30;
    page.drawText(row.campaignName, { x: 50, y: dataY, size: 10, });
    page.drawText(row.groups, { x: 50, y: dataY, });
    page.drawText(row.channelName, { x: 50, y: dataY });
    page.drawText(row.startDate, { x: 50, y: dataY });
    page.drawText(row.status, { x: 50, y: dataY });

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'report.pdf';
    link.click();

    URL.revokeObjectURL(link.href);
  }

  showDetails(data: any): void {

  }

  applyFilter(e: Event): void {
    const filterValue = (e.target as HTMLInputElement).value;
    
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

      this.marketingCareService.getAllCampaigns(params).subscribe((res: any) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.scheduledDetails = res.data;
          this.dataSource = new MatTableDataSource(this.scheduledDetails);
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
      this.marketingCareService.getAllCampaigns(params).subscribe((res: any) => {
        if (res && res.data && res.data.length > 0) {
          this.isSpinner = false;
          this.scheduledDetails = res.data;
          this.dataSource = new MatTableDataSource(this.scheduledDetails);
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

  handlePageinatorEventScheduledCampaign(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getCampaignList();
  }
  deleteType(id: number): void {
    this.apimarketing.deleteCampignSchedule(id).subscribe((res: any) => {

      if (res && res.data == '1') {
        this.toastr.successToastr('Campign Deleted  successfully.', '', true);
        this.isSpinner = false;
      } else {
        this.toastr.errorToastr(res.message);
        this.isSpinner = false;
      }
      this.getCampaignList();
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

  getDeliveryReportDetails(id: number): void {
    this.apimarketing.getDeliveryReport(id).subscribe((res: any) => {
      if (res && res.data) {

        this.exportAsXLSX(res.data)
      }
    })
  }

  exportAsXLSX(excelJsonData: any): void {
    this.excelService.exportAsExcelFile(excelJsonData, "sample");
  }
  getStatusText(status: number): string {
    switch (status) {
      case MarketingCampaignScheduleStatusEnum.Pending:
        return MarketingCampaignScheduleStatusEnum[`${status}`];
      case MarketingCampaignScheduleStatusEnum.Scheduled:
        return MarketingCampaignScheduleStatusEnum[`${status}`];
      case MarketingCampaignScheduleStatusEnum.Completed:
        return MarketingCampaignScheduleStatusEnum[`${status}`];

      default:
        return 'Unknown Status';
    }
  }
  getStatusBackgroundColor(status: MarketingCampaignScheduleStatusEnum): string {
    switch (status) {
        case MarketingCampaignScheduleStatusEnum.Pending:
            return '#A9DDF5';
        case MarketingCampaignScheduleStatusEnum.Scheduled:
            return '#EF6D21';
        case MarketingCampaignScheduleStatusEnum.Completed:
            return '#33C601';
        default:
            return '';
    }
}

getStatusColor(status: MarketingCampaignScheduleStatusEnum): string {
  switch (status) {
    case MarketingCampaignScheduleStatusEnum.Pending:
        return '#000';
    case MarketingCampaignScheduleStatusEnum.Scheduled:
        return '#ffffff';
    case MarketingCampaignScheduleStatusEnum.Completed:
        return '#ffffff';
    default:
        return '';
}
}
openCampaignTask(){
  this.isSpinner = true;
  this.apimarketing.marketingCareSendCampaignTask().subscribe((res: any) => {
    if (res) {
      this.isSpinner = false;
      this.getCampaignList();
    }
  })}
}

