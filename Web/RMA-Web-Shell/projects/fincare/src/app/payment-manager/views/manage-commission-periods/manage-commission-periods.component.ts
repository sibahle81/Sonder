import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CommissionPeriod } from '../../models/commission-period';
import { CommissionService } from '../../services/commission.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AddCommissionPeriodComponent } from './add-commission-period/add-commission-period.component';
import { EditCommissionPeriodComponent } from './edit-commission-period/edit-commission-period.component';
import { SharedDataService } from '../../services/shared-data.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-manage-commission-periods',
  templateUrl: './manage-commission-periods.component.html',
  styleUrls: ['./manage-commission-periods.component.css']
})
export class ManageCommissionPeriodsComponent implements OnInit {
  displayedColumns = ['yyyy', 'mm', 'startDate', 'endDate', 'actions'];
  public dataSource = new MatTableDataSource<CommissionPeriod>();
  index: number;
  id: number;
  isProcessing = false;
  processMessage: string;
  isError = false;
  errMessage = 'Commission band with same details exists';
  commissionPeriods: CommissionPeriod[];
  periodId: number;
  isLoadingCommissionBands$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  constructor(public commonService: CommonService,
              public dialog: MatDialog,
              private readonly confirmservice: ConfirmationDialogsService,
              private readonly router: Router,
              private readonly alertService: AlertService,
              private readonly activatedRoute: ActivatedRoute,
              public commissionService: CommissionService,
              private sharedDataService: SharedDataService,
              private datePipe: DatePipe) {}

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  ngOnInit() {
    this.isError = false;
    this.activatedRoute.params.subscribe(params => {
      if (params.periodId) {
        this.periodId = params.periodId;
        this.getCommissionPeriods(this.periodId);
      }
    });
    
  }

  refresh() {
    if (this.periodId > 0) {
      this.getCommissionPeriods(this.periodId);
    }
    if(this.dataSource.data.length > 1)
      this.paginator._changePageSize(this.paginator.pageSize);
  }

  transformDate(commissionPeriod: CommissionPeriod) {
    const startDate = new Date(this.datePipe.transform(new Date(commissionPeriod.startDate), 'yyyy-MM-dd'));
    const endDate = new Date(this.datePipe.transform(new Date(commissionPeriod.endDate), 'yyyy-MM-dd'));
    commissionPeriod.startDate = startDate;
    commissionPeriod.endDate = endDate;
  }

  addNew() {
    const dialogRef = this.dialog.open(AddCommissionPeriodComponent, {
      data: {commissionPeriod: null }
    });
    this.isError = false;
    
      dialogRef.afterClosed().subscribe(result => {
        if (result === 1) {
          this.isProcessing = true;
          this.processMessage = 'Adding commission period...';
          const commissionPeriod = this.commissionService.getDialogData();
          this.transformDate(commissionPeriod);
          this.commissionService.addCommissionPeriod(commissionPeriod).subscribe(res=>{
            this.periodId = res;
            const commissionHeader = this.sharedDataService.commissionHeader;
            commissionHeader.periodId = this.periodId;
            this.commissionService.updateCommissionHeader(commissionHeader).subscribe(result => {
              this.dataSource.data.push(this.commissionService.getDialogData());
              this.refresh();
              this.done('Commission period added successfully');
            });
          });
        }
      });
  }

  startEdit(commissionPeriod: CommissionPeriod): void {
    const dialogRef = this.dialog.open(EditCommissionPeriodComponent, {
      data: { periodId: commissionPeriod.periodId, startDate: commissionPeriod.startDate, endDate: commissionPeriod.endDate,
       yyyy: commissionPeriod.yyyy, mm: commissionPeriod.mm, periodChangeReasonId: commissionPeriod.periodChangeReasonId}
    });
    this.isError = false;
    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        this.isProcessing = true;
        this.processMessage = 'Updating commission period...';
        this.commissionService.editCommissionPeriod(this.commissionService.getDialogData()).subscribe(res=>{
        const foundIndex = this.dataSource.data.findIndex(x => x.periodId === commissionPeriod.periodId);
        this.dataSource.data[foundIndex] = this.commissionService.getDialogData();
        this.refresh();
        this.done('Commission period updated successfully');
        });
      }
    });
  }

  done(statusMesssage: string) {
    this.alertService.success(statusMesssage, 'Success', true);
    this.isProcessing = false;
  }

  clear() {
    this.router.navigate(['/fincare/payment-manager/commission-release', {isDataReload: 'true'}]);
  }

  searchData(data) {
    this.applyFilter(data);
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator.firstPage();
  }

  getCommissionPeriods(periodId: number) {
    this.isLoadingCommissionBands$.next(true);
    this.commissionService.getCommissionPeriodByPeriodId(periodId).subscribe(commissionPeriods => {
      this.dataSource.data = commissionPeriods;
      this.commissionPeriods = commissionPeriods;
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
      this.isLoadingCommissionBands$.next(false);
    });
  }
}
