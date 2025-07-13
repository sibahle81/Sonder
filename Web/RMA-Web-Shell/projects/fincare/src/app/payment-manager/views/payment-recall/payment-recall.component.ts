import { Component, OnInit } from '@angular/core';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';

@Component({
  selector: 'app-payment-recall',
  templateUrl: './payment-recall.component.html',
  styleUrls: ['./payment-recall.component.css']
})
export class PaymentRecallComponent implements OnInit {
  paymentTypeFilter: PaymentTypeEnum[] = [PaymentTypeEnum.Commission];
  constructor() { }

  ngOnInit(): void {
  }

}
