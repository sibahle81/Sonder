import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserPagedPaymentsDataSource } from './user-paged-payments.datasource';
import { PaymentService } from '../../../services/payment.service';
import { PaymentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/payment-status-enum';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';

@Component({
  selector: 'user-paged-payments',
  templateUrl: './user-paged-payments.component.html',
  styleUrls: ['./user-paged-payments.component.css']
})
export class UserPagedPaymentsComponent extends UnSubscribe implements OnChanges {

  @Input() user: User;

  @Output() emitClaimCount: EventEmitter<number> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['payee','policyReference','claimNumber', 'paymentType', 'paymentStatus'];

  dataSource: UserPagedPaymentsDataSource;
  currentQuery: any;

  constructor(public paymentService: PaymentService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new UserPagedPaymentsDataSource(this.paymentService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    this.currentQuery = this.user && this.user.id > 0 ? this.user.id.toString() : 0;
    this.getData();
    this.emitRowCount();
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  emitRowCount() {
    this.dataSource.hasData$.subscribe(result => {
      if (result) {
        this.emitClaimCount.emit(this.dataSource.data.rowCount);
      }
    });
  }

  getPaymentStatus(id: number) {
    if (!id) { return };
    return this.formatText(PaymentStatusEnum[id]);
  }

  getPaymentType(id: number) {
    if (!id) { return };
    return this.formatText(PaymentTypeEnum[id]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}

