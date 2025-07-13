import { Payment } from 'projects/fincare/src/app/shared/models/payment.model';
import { AbilityCollectionsAudit } from './../../models/ability-collections-audit';
import { AbilityCollectionsAuditComponent } from './../ability-collections-audit/ability-collections-audit.component';
import { Component, Input, SimpleChanges, OnChanges, ViewChild, OnInit, AfterViewInit, AfterContentInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';

import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { PremiumListingTransaction } from './../../../../../../clientcare/src/app/policy-manager/shared/entities/premium-listing-transaction';
import { PremiumListingService } from './../../../../../../clientcare/src/app/policy-manager/shared/Services/premium-listing.service';
import { PaymentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/payment-status-enum';
import { MemberAccountHistoryDatasource } from './member-account-history.datasource';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';

@Component({
  selector: 'member-account-history',
  templateUrl: './member-account-history.component.html',
  styleUrls: ['./member-account-history.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class MemberAccountHistoryComponent implements AfterViewInit {
  @Input() policyId = 0;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  datasource: MemberAccountHistoryDatasource;
  total = 0.0;
  debit = false;

  public displayedColumns = ['invoiceDate', 'paymentDate', 'paymentStatus', 'invoiceAmount', 'paymentAmount'];

  get isDebit(): boolean {
    return this.total < 0.00;
  }

  constructor(
    private readonly premiumListingService: PremiumListingService,
  ) {
    this.datasource = new MemberAccountHistoryDatasource(this.premiumListingService);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.datasource.rowCount$.subscribe(count => this.paginator.length = count);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadData()))
      .subscribe();

    this.loadData();
  }

  loadData() {
    this.datasource.getData({
      query: this.policyId,
      pageNumber: this.paginator.pageIndex + 1,
      pageSize: this.paginator.pageSize,
      orderBy: this.sort.active,
      sortDirection: this.sort.direction,
      showActive: true
    });
    this.premiumListingService.getPremiumListingTransactionTotal(this.policyId)
      .subscribe({
        next: (result: number) => { this.total = result; }
      });
  }

  getInvoiceStatus(paymentAmount: number, invoiceAmount: number): string {
    
    if (paymentAmount == 0) {
      return InvoiceStatusEnum[InvoiceStatusEnum.Unpaid];
    }
   else if (paymentAmount >= invoiceAmount) {
      return InvoiceStatusEnum[InvoiceStatusEnum.Paid];
    }
    else if (paymentAmount < invoiceAmount) {
      return InvoiceStatusEnum[InvoiceStatusEnum.Partially];
    }
   
  }
}
