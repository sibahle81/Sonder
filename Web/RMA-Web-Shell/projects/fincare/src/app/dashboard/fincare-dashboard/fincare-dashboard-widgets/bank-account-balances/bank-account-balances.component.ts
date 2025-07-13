import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BankBalance } from 'projects/fincare/src/app/payment-manager/models/bank-balance';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'bank-account-balances',
  templateUrl: './bank-account-balances.component.html',
  styleUrls: ['./bank-account-balances.component.css']
})
export class BankAccountBalancesComponent extends UnSubscribe  implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[] = [
    'accountNumber',
    'balance',
  ];
  bankBalances: BankBalance[] = [];
  public bankBalancesDataSource = new MatTableDataSource<BankBalance>();
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  constructor(
    public paymentService: PaymentService,
  ) { super(); }

  ngOnInit(): void {
    this.getBankBalances();
  }

  getBankBalances() {
    this.isLoading$.next(true);
    this.paymentService.getBankBalances().pipe(takeUntil(this.unSubscribe$)).subscribe(balances => {
      if(balances){
        this.bankBalancesDataSource.data = balances;
        setTimeout(() => {
          this.bankBalancesDataSource.paginator = this.paginator;
          this.bankBalancesDataSource.sort = this.sort;
        });
        this.isLoading$.next(false);
      } else {this.isLoading$.next(false);}
    });
  }

}
