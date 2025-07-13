import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CommissionService } from 'projects/fincare/src/app/payment-manager/services/commission.service';
import { MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommissionAccount } from 'projects/fincare/src/app/payment-manager/models/commission-account';
import { Router } from '@angular/router';
import { SharedDataService } from 'projects/fincare/src/app/payment-manager/services/shared-data.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-broker-accounts-view',
  templateUrl: './broker-accounts-view.component.html',
  styleUrls: ['./broker-accounts-view.component.css']
})
export class BrokerAccountsViewComponent implements OnInit, AfterViewInit {
  isLoading = false;
  displayedColumns = ['accountName', 'totalPendingRelease', 'totalSubmitted', 'totalPaid', 'totalWithHeld', 'totalRejected', 'clawBackAccountBalance', 'actions'];
  currentQuery: string;
  datasource: MatTableDataSource<CommissionAccount>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  rowCount: number;
  form: UntypedFormGroup;
  commissionAccounts: CommissionAccount[];
  hasViewCommissionPermission = false;
  hasReleaseCommissionPermission = false;
  hasPrintCommissionPermission = false;
  isAuthorized = false;
  menus: { title: string, action: string, disable: boolean }[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly commissionService: CommissionService,
    private readonly router: Router,
    private sharedDataService: SharedDataService) {

      this.datasource = new MatTableDataSource<CommissionAccount>();
     }

  ngOnInit() {
    this.hasViewCommissionPermission = userUtility.hasPermission('View Commission');
    this.hasReleaseCommissionPermission = userUtility.hasPermission('Release Commission');
    this.hasPrintCommissionPermission = userUtility.hasPermission('Print Commission');

    if (this.hasViewCommissionPermission || this.hasReleaseCommissionPermission) {
      this.isAuthorized = true;
    }

    if (this.isAuthorized) {
      this.createForm();
      this.getAllCommissionAccounts();
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      filterAccount: ['', [Validators.minLength(3)]]
    });
    this.menus =
      [
        { title: 'Statements', action: 'statements', disable: false }
      ];
  }

  getAllCommissionAccounts() {
    this.isLoading = true;
    this.commissionService.getCommissionAccounts()
      .subscribe(data => {
        this.commissionAccounts = data;
        this.datasource.data = data;
        this.isLoading = false;

        setTimeout(() => this.datasource.paginator = this.paginator);
      });
  }

  searchCommissionAccounts(event: any) {
    this.isLoading = true;
    const query = this.form.get('filterAccount').value;
    if (query.length > 0) {
      const data = this.commissionAccounts.filter(c => c.accountCode.toLowerCase().indexOf(query.toLowerCase()) > -1 || c.accountName.toLowerCase().indexOf(query.toLowerCase()) > -1);
      this.datasource.data = data;
      this.rowCount = data.length;
    } else {
      this.datasource.data = this.commissionAccounts;
    }
    this.isLoading = false;

    setTimeout(() => this.datasource.paginator = this.paginator);
  }

  getCommissionsByAccount(accountTypeId: number, accountId: number, headerStatusId: number) {
    this.router.navigate(['/fincare/payment-manager/broker-account-summary', accountTypeId, accountId, headerStatusId]);
  }

  getCommissionClawBackMovementByAccount(accountTypeId: number, accountId: number) {
    this.router.navigate(['/fincare/payment-manager/broker-account-clawback-summary', accountTypeId, accountId]);
  }

  ngAfterViewInit() {
    this.datasource = new MatTableDataSource<CommissionAccount>(this.commissionAccounts);
    setTimeout(() => this.datasource.paginator = this.paginator);
    this.datasource.sort = this.sort;
  }

  onMenuItemClick(item: CommissionAccount, menu: any): void {
    switch (menu.action) {
      case 'statements':
        this.viewStatement(item);
        break;
      case 'reports':
        this.viewReports(item);
        break;
      case 'audit_trail':
        this.viewReports(item);
        break;
    }
  }

  viewStatement(commissionAccount: CommissionAccount) {
    this.sharedDataService.data[0] = commissionAccount.accountName;
    this.sharedDataService.data[1] = commissionAccount.accountCode;
    this.router.navigate(['/fincare/payment-manager/commission-statement', commissionAccount.accountTypeId, commissionAccount.accountId]);
  }

  viewReports(commissionAccount: CommissionAccount) {
    this.router.navigate(['/fincare/payment-manager/commission-statement', commissionAccount.accountTypeId, commissionAccount.accountId]);
  }

  viewAuditTrail(commissionAccount: CommissionAccount) {
    this.sharedDataService.data[0] = commissionAccount.accountName;
    this.sharedDataService.data[1] = commissionAccount.accountCode;
    this.router.navigate(['/fincare/payment-manager/commission-audit-trail', commissionAccount.accountTypeId, commissionAccount.accountId]);
  }

  navigateBack() {
    this.router.navigateByUrl('/fincare/payment-manager');
  }

  public calculateTotalPendingRelease() {
    return this.commissionAccounts.reduce((accum, curr) => accum + curr.totalPendingRelease, 0);
  }

  public calculateTotalSubmitted() {
    return this.commissionAccounts.reduce((accum, curr) => accum + curr.totalSubmitted, 0);
  }

  public calculateTotalRejected() {
    return this.commissionAccounts.reduce((accum, curr) => accum + curr.totalRejected, 0);
  }

  public calculateTotalPaid() {
    return this.commissionAccounts.reduce((accum, curr) => accum + curr.totalPaid, 0);
  }

  public calculateTotalWithheld() {
    return this.commissionAccounts.reduce((accum, curr) => accum + curr.totalWithHeld, 0);
  }

  public calculateclawBackAccountBalance() {
    return this.commissionAccounts.reduce((accum, curr) => accum + curr.clawBackAccountBalance, 0);
  }
}
