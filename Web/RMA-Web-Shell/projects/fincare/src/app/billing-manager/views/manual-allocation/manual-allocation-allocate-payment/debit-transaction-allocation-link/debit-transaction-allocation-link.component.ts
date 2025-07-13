import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InterDebtorTransfer } from '../../../../models/interDebtorTransfer';
import { RefundHeader } from '../../../../models/refund-header';
import { Transaction } from '../../../../models/transaction';
import { CollectionsService } from '../../../../services/collections.service';
import { TransactionsService } from '../../../../services/transactions.service';

@Component({
  selector: 'debit-transaction-allocation-link',
  templateUrl: './debit-transaction-allocation-link.component.html',
  styleUrls: ['./debit-transaction-allocation-link.component.css']
})
export class DebitTransactionAllocationLinkComponent implements OnInit, AfterViewInit {

  @Input() selectedTransactionTypeId: number;
  @Input() rolePlayerId: number;
  @Input() amount: number;
  @Output() interDebtorTransferLinkSelected: EventEmitter<InterDebtorTransfer> = new EventEmitter();
  @Output() refundLinkSelected: EventEmitter<RefundHeader> = new EventEmitter();
  @Output() paymentLinkSelected: EventEmitter<Transaction> = new EventEmitter();
  isLoading = false;
  refundsDisplayedColumns = ['reference', 'headerTotalAmount', 'createdDate', 'actions'];
  refundsDataSource = new MatTableDataSource<RefundHeader>();
  interDebtorTransferDisplayedColumns = ['fromDebtorNumber', 'transferAmount', 'receiverDebtorNumber', 'receiverAccountNumber', 'createdDate', 'actions'];
  interDebtorTransferDataSource = new MatTableDataSource<InterDebtorTransfer>();
  paymentsDisplayedColumns = ['rmaReference', 'amount', 'transactionDate', 'actions'];
  paymentsDataSource = new MatTableDataSource<Transaction>();
  @ViewChild('paginator_refunds', { static: false }) refundsPaginator: MatPaginator;
  @ViewChild('paginator_interdebtortransfers', { static: false }) interDebtorTransferPaginator: MatPaginator;
  @ViewChild('paginator_payments', { static: false }) paymentsPaginator: MatPaginator;
  filteredPayments: Transaction[];

  constructor(private readonly collectionsService: CollectionsService, private readonly transactionsService: TransactionsService) { }

  ngOnInit() {
    if (this.selectedTransactionTypeId === TransactionTypeEnum.InterDebtorTransfer as number) {
      this.getInterDebtorTransfers();
    } else if (this.selectedTransactionTypeId === TransactionTypeEnum.Refund as number) {
      this.getRefunds();
    } else if (this.selectedTransactionTypeId === TransactionTypeEnum.PaymentReversal as number) {
      this.getPayments();
    }
  }

  getRefunds() {
    this.isLoading = true;
    this.collectionsService.getDebtorRefunds(this.rolePlayerId).pipe(tap(data => {
      this.refundsDataSource.data = data;
      this.isLoading = false;
    }
    )).subscribe();
  }

  getInterDebtorTransfers() {
    this.isLoading = true;
    this.collectionsService.getDebtorInterDebtorTransfers(this.rolePlayerId).pipe(tap(data => {
      this.interDebtorTransferDataSource.data = data;
      this.isLoading = false;
    }
    )).subscribe();
  }

  getPayments() {
    this.isLoading = true;
    this.amount = this.amount * -1;
    this.transactionsService.getPaymentsForReturnAllocation(this.rolePlayerId, this.amount).pipe(tap(data => {
      this.filteredPayments = data;
      this.filteredPayments.forEach(payment => {
        if (!payment.rmaReference || payment.rmaReference === '') {
          payment.rmaReference = payment.bankReference;
        }
      });
      this.paymentsDataSource.data = this.filteredPayments;
      this.isLoading = false;
    }
    )).subscribe();
  }

  ngAfterViewInit() {
    if (this.selectedTransactionTypeId === TransactionTypeEnum.Refund as number) {
       this.refundsDataSource.paginator = this.refundsPaginator;
    } else if (this.selectedTransactionTypeId === TransactionTypeEnum.InterDebtorTransfer as number) {
       this.interDebtorTransferDataSource.paginator = this.interDebtorTransferPaginator;
    } else if (this.selectedTransactionTypeId === TransactionTypeEnum.Payment as number) {
      this.paymentsDataSource.paginator = this.paymentsPaginator;
   }
  }

  refundChecked(event: any, item: RefundHeader) {
    if (event.checked) {
      this.refundLinkSelected.emit(item);
     }
  }

  interDebtorTransferChecked(event: any, item: InterDebtorTransfer) {
    if (event.checked) {
      this.interDebtorTransferLinkSelected.emit(item);
    }
  }

  paymentChecked(event: any, item: Transaction) {
    if (event.checked) {
      this.paymentLinkSelected.emit(item);
     }
  }
}
