import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { PaymentEstimate } from '../../../../shared/models/payment-estimates.model';
import { PaymentService } from '../../../../payment-manager/services/payment.service';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { PolicyPayment } from '../../../../shared/models/PolicyPayment';
import { Payment } from '../../../../shared/models/payment.model';


@Component({
  selector: 'payment-daily-estimates-chart',
  templateUrl: './payment-daily-estimates-chart.component.html',
  styleUrls: ['./payment-daily-estimates-chart.component.css']
})
export class PaymentDailyEstimatesChartComponent implements OnInit {

  isLoading: boolean;
  dataChange: BehaviorSubject<PaymentEstimate[]> = new BehaviorSubject<PaymentEstimate[]>([]);
  hasData = false;

  constructor(
    private paymentService: PaymentService,
    private readonly datePipe: DatePipe) { }

  // Chart Details below
  public chartType = 'pie';
  public data: number[] = [0, 0, 0];
  public chartOptions: any = { responsive: true, maintainAspectRatio: false };
  public chartLabels: Array<any> = ['Claims', 'Commssions', 'Refunds'];
  public chartColors: Array<any> = [
    {
      backgroundColor: ['#E56D99', '#f59d38', '#a68e3f'],
      hoverBackgroundColor: ['#e61c66', '#f5880c', '#a88613'],
      borderWidth: 2,
    }
  ];

  ngOnInit() {
    this.getDailyEstimates();
  }

  getDailyEstimates(): void {
    this.isLoading = true;
    this.paymentService.getDailyEstimates('','').subscribe(data => {
      this.setPieChartData(data);
      this.isLoading = false;
    });
  }

  setPieChartData(policyPayment: PolicyPayment) {
    const claims = policyPayment.payments.filter(a => a.paymentType === PaymentTypeEnum.Claim);
    const claimAmount = this.setObject(policyPayment, claims, 'Claims');
    const commissions = policyPayment.payments.filter(a => a.paymentType === PaymentTypeEnum.Commission);
    const commissionAmount = this.setObject(policyPayment, commissions, 'Commission');
    const refunds = policyPayment.payments.filter(a => a.paymentType === PaymentTypeEnum.Refund);
    const refundAmount = this.setObject(policyPayment, refunds, 'Refund');
    this.hasData = true;
    this.data = [claimAmount, commissionAmount, refundAmount];
  }

  setObject(policyPayment: PolicyPayment, payments: Payment[], type: string): number {
    const paymentType = new PaymentEstimate();
    if (policyPayment.payments.length > 0) {
      if (payments.length > 0) {
        paymentType.createdDate = new Date();
        paymentType.paymentType = type;
        paymentType.numberOfTransactions = payments.length;
        payments.forEach(element => {
          paymentType.amount = +element.amount;
        });
      }
    }
    return paymentType.amount;
  }

}
