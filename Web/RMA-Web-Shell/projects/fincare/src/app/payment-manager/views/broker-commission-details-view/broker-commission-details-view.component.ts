import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { UntypedFormBuilder, FormControl, UntypedFormGroup } from '@angular/forms';
import { CommissionService } from 'projects/fincare/src/app/payment-manager/services/commission.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommissionDetail } from 'projects/fincare/src/app/payment-manager/models/commission-detail';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SharedDataService } from 'projects/fincare/src/app/payment-manager/services/shared-data.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { CommissionBrokerProduct } from 'projects/fincare/src/app/shared/models/commission-broker-product';
import { MatRadioChange } from '@angular/material/radio';
import { HeaderStatusEnum } from 'projects/fincare/src/app/shared/enum/header-status.enum';
import { CommissionClawBackAccountMovement } from 'projects/fincare/src/app/payment-manager/models/commission-clawback-account-movement';
import { ToastrManager } from 'ng6-toastr-notifications';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-broker-commission-details-view',
  templateUrl: './broker-commission-details-view.component.html',
  styleUrls: ['./broker-commission-details-view.component.css']
})
export class BrokerCommissionDetailsViewComponent implements OnInit, AfterViewInit {
  isLoading = false;
  displayedColumns = ['policyNumber', 'repCode', 'transactionDate', 'allocatedAmount', 'commissionAmount', 'adminServiceFeeAmount', 'totalAmount'];
  currentQuery: string;
  datasource = new MatTableDataSource<CommissionDetail>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  rowCount: number;
  headerTotal = 0;
  hearderName: string;
  accountCode: string;
  accountName: string;
  headerStatusId: number;
  form: UntypedFormGroup;
  periodMonth: string;
  periodYear: string;
  showReport = false;
  isDownloading = false;
  hearderId: number;

  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  formatAudit: string;
  isDownload: string;
  errors: string[] = [];
  hasViewCommissionPermission = false;
  hasReleaseCommissionPermission = false;
  hasPrintCommissionPermission = false;
  isAuthorized = false;

  products: CommissionBrokerProduct[] = [];
  reportFormats: string[] = ['PDF', 'EXCEL', 'CSV'];
  selectedreportFormat: string;
  @Input() selectreportFormat: string;
  commissionDetails: CommissionDetail[] = [];
  commissionClawBackAccountMovements: CommissionClawBackAccountMovement[] = [];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly commissionService: CommissionService,
    private readonly activatedRoute: ActivatedRoute,
    private location: Location,
    private sharedDataService: SharedDataService,
    private readonly lookupService: LookupService,
    private readonly authService: AuthService,
    private readonly toastr: ToastrManager,
    private readonly router: Router) { }

  ngOnInit() {
    this.selectedreportFormat = this.reportFormats[0];
    this.isDownload = 'true';

    this.hasViewCommissionPermission = userUtility.hasPermission('View Commission');
    this.hasReleaseCommissionPermission = userUtility.hasPermission('Release Commission');
    this.hasPrintCommissionPermission = userUtility.hasPermission('Print Commission');
    if (this.hasViewCommissionPermission || this.hasReleaseCommissionPermission) {
      this.isAuthorized = true;
    }

    if (this.isAuthorized) {
      this.createForm();
      this.activatedRoute.params.subscribe((params: any) => {
        if (params.headerId) {
          this.getHeaderDetails(params.headerId);
          this.headerStatusId = params.headerStatusId;
          this.hearderId = params.headerId;
        }
      });

      this.accountName = this.sharedDataService.data[0];
      this.accountCode = this.sharedDataService.data[1];
      this.periodMonth = this.sharedDataService.data[2];
      this.periodYear = this.sharedDataService.data[3];
      this.headerTotal = parseFloat(this.sharedDataService.data[4]);

    }
  }
  createForm() {
    this.form = this.formBuilder.group({
      payStatusType: [null]
    });
  }

  getHeaderDetails(headerId: number) {
    const total = 0;
    this.isLoading = true;
    this.commissionService.getCommissionDetailByHeaderId(headerId)
      .subscribe(data => {
        this.datasource.data = data;
        this.rowCount = data.length;
        this.isLoading = false;
        this.commissionDetails = data;
      });

    this.commissionService.getCommissionClawBackAccountMovementsByHeaderId(headerId)
      .subscribe(data => {
        this.commissionClawBackAccountMovements = data;
      });
  }

  getMonthName(value: string) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // tslint:disable-next-line: radix
    return monthNames[parseInt(value) - 1];
  }

  navigateBack() {
    if (this.activatedRoute.snapshot.paramMap.get('IsWorkPool') != null && this.activatedRoute.snapshot.paramMap.get('IsWorkPool') == 'true') {
      this.router.navigate(['/fincare/payment-manager/commission-release', { IsWorkPool: 'true' }]);

    }
    else{
      this.location.back();
    }
  }

  downloadReport(): void {
    this.errors = [];
    this.showReport = false;
    this.isDownloading = true;
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (data: any) => {
        this.parametersAudit = {
          headerId: this.hearderId,
          headerStatusId: this.headerStatusId
        };

        this.reportServerAudit = data;
        this.reportUrlAudit = 'RMA.Reports.FinCare/RMABrokerageCommissionDetails';
        this.showParametersAudit = 'true';
        this.languageAudit = 'en-us';
        this.widthAudit = 10;
        this.heightAudit = 10;
        this.toolbarAudit = 'false';
        this.showReport = true;
        this.isDownloading = false;
      },
      error => {
        this.toastr.errorToastr(error);
        this.showReport = false;
        this.isDownloading = false;
      }
    );
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  reportFormatChange(event: MatRadioChange) {
    this.isDownload = 'true';
    this.reportUrlAudit = null;
    this.selectedreportFormat = event.value;
    if (event.value === 'EXCEL') {
      this.isDownload = 'false';
    }
  }

  public calculateTotalCommission() {
    return this.commissionDetails.reduce((accum, curr) => accum + curr.commissionAmount, 0);
  }

  public calculateTotalIsf() {
    return this.commissionDetails.reduce((accum, curr) => accum + curr.adminServiceFeeAmount, 0);
  }

  public calculateTotalPremiumCollected() {
    return this.commissionDetails.reduce((accum, curr) => accum + curr.allocatedAmount, 0);
  }

  public calculateGrandTotal() {
    return this.commissionDetails.reduce((accum, curr) => accum + curr.totalAmount, 0);
  }

  public getClawBackTotal() {
    let retVal = 0;
    const lastRow = this.commissionClawBackAccountMovements[this.commissionClawBackAccountMovements.length - 1];
    if (lastRow) {
      retVal = lastRow.currentClawBackBalance;
    }
    return retVal;
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
}
