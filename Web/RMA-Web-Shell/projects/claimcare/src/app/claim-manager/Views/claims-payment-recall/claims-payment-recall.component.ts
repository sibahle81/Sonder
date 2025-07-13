import { Component, OnInit } from '@angular/core';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';

@Component({
  selector: 'app-claims-payment-recall',
  templateUrl: './claims-payment-recall.component.html',
  styleUrls: ['./claims-payment-recall.component.css']
})
export class ClaimsPaymentRecallComponent implements OnInit {
  paymentTypeFilter: PaymentTypeEnum[] = [PaymentTypeEnum.Claim];
  constructor() { }

  ngOnInit(): void {
  }

}
