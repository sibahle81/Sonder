import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { PBPayment } from 'projects/fincare/src/app/shared/models/PBPayment.model';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';

@Component({
  selector: 'lib-policy-payment-list',
  templateUrl: './policy-payment-list.component.html',
  styleUrls: ['./policy-payment-list.component.css']
})
export class PolicyPaymentListComponent extends UnSubscribe  implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[] = [
    'policyNumber',
    'reference',
    'amount',
  ];
  policy: Policy;
  policyPayments: PBPayment[] = [];  
  public policyBasedPayments = new MatTableDataSource<PBPayment>();
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  policyId: number;
  selectedPolicy: Policy;
  constructor(
    public paymentService: PaymentService,
  ) { super(); }

  ngOnInit(): void {
    this.getPolicyPaymentDetails();
  }

  getPolicyPaymentDetails() {
    this.isLoading$.next(true);
    this.policyId = 623800;
    this.paymentService.getPolicyPaymentDetails(this.policyId,'','').pipe(takeUntil(this.unSubscribe$)).subscribe(data => {
      if (data) {
        this.policyBasedPayments.data = data.payments;
        setTimeout(() => {
          this.policyBasedPayments.paginator = this.paginator;
          this.policyBasedPayments.sort = this.sort;
        });
        this.isLoading$.next(false);
      }
      else
      {
        this.isLoading$.next(false);
      }

    });
  }  
  onSelect()
  {
    console.log('hi');
  }
}
