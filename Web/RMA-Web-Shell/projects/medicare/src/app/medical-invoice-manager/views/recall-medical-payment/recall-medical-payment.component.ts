import { Component } from '@angular/core';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';

@Component({
  selector: 'app-recall-medical-payment',
  templateUrl: './recall-medical-payment.component.html',
  styleUrls: ['./recall-medical-payment.component.css']
})
export class RecallMedicalPaymentComponent {
  paymentTypeFilter: PaymentTypeEnum[] = [PaymentTypeEnum.MedicalInvoice];
}
