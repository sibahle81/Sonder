import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommissionHeader } from '../../models/commission-header';
import { CommissionService } from '../../services/commission.service';
import { CommissionPaymentRequest } from '../../models/commission-payment-request';
import { HeaderStatusEnum } from '../../../shared/enum/header-status.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-commission-release-confirmation',
  templateUrl: './commission-release-confirmation.component.html',
  styleUrls: ['./commission-release-confirmation.component.css']
})
export class CommissionReleaseConfirmationComponent implements OnInit, AfterViewInit {
  selectedHeaders: CommissionHeader[];
  datasource = new MatTableDataSource<CommissionHeader>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  isSumitting = false;
  displayedColumns = ['recepientCode', 'recepientName', 'status', 'totalHeaderAmount'];
  constructor(
    public dialogRef: MatDialogRef<CommissionReleaseConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly commissionService: CommissionService,
    private readonly alertService: AlertService,
    private readonly toastr: ToastrManager
  ) {
    this.selectedHeaders = data.selectedHeaders;
  }

  ngOnInit() {
    this.datasource.data = this.selectedHeaders;
  }

  doFinalSubmission() {
    this.isSumitting = true;
    const request = new CommissionPaymentRequest();
    request.commissonHeaders = this.selectedHeaders.filter(c => c.headerStatusId !== HeaderStatusEnum.Resubmitted);
    if (request.commissonHeaders.length > 0) {
      this.commissionService.releaseCommissions(request).subscribe(
      () => {
          this.toastr.successToastr('Action performed successfully');
          this.isSumitting = false;
          this.dialogRef.close(true);
        });
    }

    const requestResubmit = new CommissionPaymentRequest();
    requestResubmit.commissonHeaders = this.selectedHeaders.filter(c => c.headerStatusId === HeaderStatusEnum.Resubmitted);
    if (requestResubmit.commissonHeaders.length > 0) {
      this.commissionService.reSubmitCommissions(requestResubmit).subscribe(
        () => {
            this.toastr.successToastr('Action performed successfully');
            this.isSumitting = false;
            this.dialogRef.close(true);
        });
    }
  }

  getStatusName(statusId: number) {
    switch (statusId) {
      case HeaderStatusEnum.Withheld: return 'Withhold';
      case HeaderStatusEnum.Submitted: return 'Release';
      case HeaderStatusEnum.Resubmitted: return 'Re-Submit';
      default: return 'N/A';
    }
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  ngAfterViewInit(): void {
    this.datasource.sort = this.sort;
    this.datasource.paginator = this.paginator;
  }

  public calculateTotalCommission() {
    return this.selectedHeaders.reduce((accum, curr) => accum + curr.totalHeaderAmount, 0);
  }
}

