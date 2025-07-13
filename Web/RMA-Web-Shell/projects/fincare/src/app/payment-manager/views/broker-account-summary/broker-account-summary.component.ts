import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CommissionService } from 'projects/fincare/src/app/payment-manager/services/commission.service';
import { CommissionHeader } from 'projects/fincare/src/app/payment-manager/models/commission-header';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderStatusEnum } from 'projects/fincare/src/app/shared/enum/header-status.enum';
import { Location } from '@angular/common';
import { SharedDataService } from 'projects/fincare/src/app/payment-manager/services/shared-data.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { CommissionPaymentInstruction } from 'projects/fincare/src/app/payment-manager/models/commission-payment-instruction';
import { CommissionPaymentTypeEnum } from 'projects/fincare/src/app/shared/enum/commission-payment-type.enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-broker-account-summary',
  templateUrl: './broker-account-summary.component.html',
  styleUrls: ['./broker-account-summary.component.css']
})
export class BrokerAccountSummaryComponent implements OnInit, AfterViewInit {
  isLoading = false;
  displayedColumns = ['periodYear', 'periodMonth', 'totalHeaderAmount', 'breakdown'];
  currentQuery: string;
  datasource = new MatTableDataSource<CommissionHeader>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  rowCount: number;
  totalDueAmount = 0;
  totalClawBackAmount = 0;
  totalReleasedAmount = 0;
  hearderName: string;
  accountCode: string;
  accountName: string;
  headerStatusId: number;

  showReport = false;
  isDownloading = false;

  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  errors: string[] = [];
  hasViewCommissionPermission = false;
  hasReleaseCommissionPermission = false;
  hasPrintCommissionPermission = false;
  isAuthorized = false;
  releasedDisplayedColumns = ['paymentType', 'paymentDate', 'amount', 'status', 'comment'];
  isReleaseDetails = false;
  releaseDetailsDatasource = new MatTableDataSource<CommissionPaymentInstruction>();
  breakdownHeading = '';
  isRejectedDetails = false;
  constructor(
    private readonly commissionService: CommissionService,
    private readonly activatedRoute: ActivatedRoute,
    private router: Router, private location: Location,
    private sharedDataService: SharedDataService,) { }

  ngOnInit() {
    this.totalClawBackAmount = 0;
    this.hasViewCommissionPermission = userUtility.hasPermission('View Commission');
    this.hasReleaseCommissionPermission = userUtility.hasPermission('Release Commission');
    this.hasPrintCommissionPermission = userUtility.hasPermission('Print Commission');
    if (this.hasViewCommissionPermission || this.hasReleaseCommissionPermission) {
      this.isAuthorized = true;
    }

    if (this.isAuthorized) {
      this.activatedRoute.params.subscribe((params: any) => {
        if (params.accountTypeId) {
          // tslint:disable-next-line: radix
          this.headerStatusId = parseInt(params.headerStatusId);
          this.getDisplayColumns();
          this.getCommissionsByAccount(params.accountTypeId, params.accountId, params.headerStatusId);
        }
      });
    }
  }

  getCommissionsByAccount(accountTypeId: number, accountId: number, headerStatusId: number) {
    this.commissionService.getCommissionsByAccount(accountTypeId, accountId, headerStatusId)
      .subscribe(data => {
        if (data.length > 0) {
          this.datasource.data = data;
          if (data[0].headerStatusId === HeaderStatusEnum.Submitted) {
            this.isReleaseDetails = true;
            this.releaseDetailsDatasource.data = data[0].paymentInstructions;
            this.breakdownHeading = 'Released';
            this.releasedDisplayedColumns = ['paymentType', 'paymentDate', 'amount', 'status'];
          } else if (data[0].headerStatusId === HeaderStatusEnum.Rejected) {
            this.isRejectedDetails = true;
            this.releaseDetailsDatasource.data = data[0].paymentInstructions;
            this.breakdownHeading = 'Bank Rejection';
            this.releasedDisplayedColumns = ['paymentType', 'paymentDate', 'amount', 'comment'];
          }

          this.isLoading = false;
          this.accountName = data[0].recepientName;
          this.accountCode = data[0].recepientCode;

          if (this.totalDueAmount === 0) {
            let totalDue = 0;
            data.forEach(c => totalDue += c.totalHeaderAmount);
            this.totalDueAmount = totalDue;
          }

          if (this.totalReleasedAmount === 0) {
            let totalReleased = 0;
            data.forEach(p => p.paymentInstructions.forEach(a => totalReleased += a.amount));
            this.totalReleasedAmount = totalReleased;
          }
          if (this.headerStatusId !== HeaderStatusEnum.Pending) {
            this.totalClawBackAmount = -1 * (this.totalDueAmount - this.totalReleasedAmount);
          }

          this.sharedDataService.data[0] = data[0].recepientName;
          this.sharedDataService.data[1] = data[0].recepientCode;
        }

        setTimeout(() => this.datasource.paginator = this.paginator);
      });
  }

  getCommissionDetailByHeader(commissionHeader: CommissionHeader) {
    this.sharedDataService.data[2] = commissionHeader.periodMonth.toString();
    this.sharedDataService.data[3] = commissionHeader.periodYear.toString();
    this.sharedDataService.data[4] = commissionHeader.totalHeaderAmount.toString();
    this.router.navigate(['/fincare/payment-manager/broker-commission-details-view', commissionHeader.headerId, this.headerStatusId]);
  }

  getHearderName() {
    // tslint:disable-next-line: radix
    switch (parseInt(this.headerStatusId.toString())) {
      case HeaderStatusEnum.Paid: return 'PAID';
      case HeaderStatusEnum.Pending: return 'CURRENT';
      case HeaderStatusEnum.Withheld: return 'WITHHELD';
      case HeaderStatusEnum.Submitted: return 'RELEASED';
      case HeaderStatusEnum.Rejected: return 'REJECTED';
    }
  }

  getMonthName(value: string) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // tslint:disable-next-line: radix
    return monthNames[parseInt(value) - 1];
  }

  navigateBack() {
    this.location.back();
  }

  getPayTypeText(typeId: number) {
    switch (typeId) {
      case CommissionPaymentTypeEnum.isfPayment: return 'ISF Payment';
      case CommissionPaymentTypeEnum.commissionPayment: return 'Commission Payment';
    }
  }

  getColor(status: number) {
    if (status === HeaderStatusEnum.Rejected) {
      return 'red';
    } else if (status === HeaderStatusEnum.Pending) {
      return 'orange';
    } else if (status === HeaderStatusEnum.PartiallyPaid) {
      return 'teal';
    } else if (status === HeaderStatusEnum.Paid) {
      return 'green';
    } else if (status === HeaderStatusEnum.PartiallyRejected) {
      return 'maroon';
    }
  }

  getStatusText(status: number) {
    switch (status) {
      case HeaderStatusEnum.PartiallyPaid: return 'PARTIALLY PAID';
      case HeaderStatusEnum.Paid: return 'PAID';
      case HeaderStatusEnum.Pending: return 'CURRENT';
      case HeaderStatusEnum.Withheld: return 'WITHHELD';
      case HeaderStatusEnum.Submitted: return 'RELEASED';
      case HeaderStatusEnum.Rejected: return 'REJECTED';
      case HeaderStatusEnum.PartiallyRejected: return 'PARTIALLY REJECTED';
    }
  }

  ngAfterViewInit() {

    setTimeout(() => this.datasource.paginator = this.paginator);
    this.datasource.sort = this.sort;
  }
  viewBreakDown(commissionHeader: CommissionHeader) {
    this.releaseDetailsDatasource.data = this.datasource.data.find(c => c.headerId === commissionHeader.headerId).paymentInstructions;
  }
  getDisplayColumns() {
    // tslint:disable-next-line: radix
    switch (parseInt(this.headerStatusId.toString())) {
      case HeaderStatusEnum.Paid:
      case HeaderStatusEnum.Pending:
      case HeaderStatusEnum.Withheld:
        this.displayedColumns = ['periodYear', 'periodMonth', 'totalHeaderAmount'];
        break;
      case HeaderStatusEnum.Submitted:
      case HeaderStatusEnum.Rejected:
        this.displayedColumns = ['periodYear', 'periodMonth', 'totalHeaderAmount', 'breakdown'];
        break;
    }
  }
}
