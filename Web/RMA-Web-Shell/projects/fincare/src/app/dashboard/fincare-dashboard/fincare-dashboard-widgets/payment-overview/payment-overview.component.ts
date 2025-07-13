import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Payment } from '../../../../shared/models/payment.model';
import { PolicyPayment } from '../../../../shared/models/PolicyPayment';
import { PaymentService } from '../../../../payment-manager/services/payment.service';
import { PaymentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/payment-status-enum';
import { PaymentTableRefundComponent } from '../payment-table-refund/payment-table-refund.component';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { PaymentTableCommissionComponent } from '../payment-table-commission/payment-table-commission.component';
import { ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'payment-overview',
  templateUrl: './payment-overview.component.html',
  styleUrls: ['./payment-overview.component.css']
})
export class PaymentOverviewComponent implements OnInit {

  @ViewChild(PaymentTableRefundComponent, { static: true }) refundTable: PaymentTableRefundComponent;
  @ViewChild(PaymentTableCommissionComponent, { static: false }) commissionTable: PaymentTableCommissionComponent;

  @Input() paymentType: PaymentTypeEnum;

  fixedTotalPayments = 0;
  heading: string;

  minDate: Date;
  fromDate: Date;
  toDate: Date;
  isToDateSelected = false;
  isToDateGroupSelected = false;
  form: UntypedFormGroup;
  isLoading = false;
  policyPayments = new PolicyPayment();
  noDataHeading = 'No Data Available';
  year = (new Date().getFullYear() - 1).toString();
  day = new Date().getDay().toString();
  myDictionary: { [index: string]: number; } = {};
  datePipe = new DatePipe('en-US');

  // INDIVIDUAL
  totalPaymentsHeading = 0;
  filterHeading = '';
  totalAmountHeading = 0;
  hasData = false;
  allPayments: Payment[];
  filteredPayments: Payment[];

  // Chart Details below
  public chartType = 'bar';
  public piechartData: number[] = [];
  public pieChartLegend = false;
  public pieChartPlugins = [pluginDataLabels];
  public pieChartOptions: ChartOptions = {
    responsive: true,
    scales : {
      yAxes: [{
         ticks: {
            beginAtZero: true
          }
      }]
    },
    legend: {
      position: 'top',
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'center',
        color: 'rgb(255,255,255)',
        backgroundColor: 'rgb(0,0,0)',
        formatter: (value, ctx) => {
          const label = `${ctx.dataset.data[ctx.dataIndex]}`; // Thhis is the name: ${ctx.chart.data.labels[ctx.dataIndex]}
          return label;
        },
      },
    }
  };
  public chartLabels: Array<string> = [];
  public chartColors: Array<any> = [
    {
      backgroundColor: ['#E56D99', '#f59d38', '#a68e3f', '#e8e517', '#55bbbd', '#90e86b', '#ed5345'],
      hoverBackgroundColor: ['#e61c66', '#f5880c', '#a88613', '#e8e517', '#10e7eb', '#53e815', '#ed2513'],
      borderWidth: 2,
    }
  ];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly paymentService: PaymentService
  ) {
  }

  loadLookupLists(): void {
    this.getAllPayments();

    this.heading = PaymentTypeEnum[this.paymentType];
  }

  ngOnInit() {
    this.createForm();
    this.loadLookupLists();
  }

  createForm(): void {
    this.minDate = new Date(`${this.year}-01-${this.day}`);
    this.form = this.formBuilder.group(
      {
        startDate: new UntypedFormControl(''),
        endDate: new UntypedFormControl('')
      }
    );
  }

  public getAllPayments() {
    this.isLoading = true;
    const paymentType = this.paymentType;

    this.paymentService.getPaymentsOverviewByPaymentType(paymentType).subscribe(result => {
      this.filterHeading = 'All Payments';
      this.totalPaymentsHeading = result.payments.length;
      this.totalAmountHeading = this.getAmount(result);
      this.fixedTotalPayments = result.payments.length;
      this.filteredPayments = result.payments;

      if (result.payments.length > 0) {
        this.allPayments = result.payments;
      }
      this.setPageData(result);
    });
  }

  clearChartDataAndLabels() {
    this.piechartData = [];
    this.chartLabels = [];
    this.filterHeading = '';
  }


  // Setting the pie chart with all the individual claims
  SetPieChartWithAllIndividualClaims() {
    this.policyPayments.payments = this.allPayments;
    this.filterHeading = 'All Payments';
    this.totalPaymentsHeading = this.fixedTotalPayments;
    this.totalAmountHeading = this.getAmount(this.policyPayments);

    this.setPageData(this.policyPayments);
  }

  getAmount(result: PolicyPayment): number {
    let total = 0;
    result.payments.forEach(a => {
      total += a.amount;
    });
    return parseFloat(total.toFixed(2));
  }


  // Clearing all the controls for individual
  ClearpiechartData() {
    if (this.refundTable) {
      this.refundTable.hideTable();
    }

    this.clearChartDataAndLabels();
    this.form.patchValue({
    });

    if (!this.allPayments) {
      this.getAllPayments();
    } else {
      this.policyPayments.payments = this.allPayments;
      this.filterHeading = 'All Payments';
      this.totalPaymentsHeading = this.allPayments.length;
      this.totalAmountHeading = this.getAmount(this.policyPayments);
      this.setPageData(this.policyPayments);
    }
  }

  // ======== GROUP ======== //

  clearDateFields() {
    this.form.patchValue({
      startDate: '',
      endDate: ''
    });
  }

  // Setting the pie chart data
  setPieChartData(result: PolicyPayment) {
    if (this.refundTable) {
      this.refundTable.hideTable();
    }
    this.policyPayments = result;
    const pending = this.GetStatusLength(PaymentStatusEnum.Pending, result);
    const submitted = this.GetStatusLength(PaymentStatusEnum.Submitted, result);
    const paid = this.GetStatusLength(PaymentStatusEnum.Paid, result);
    const rejected = this.GetStatusLength(PaymentStatusEnum.Rejected, result);
    const reconciled = this.GetStatusLength(PaymentStatusEnum.Reconciled, result);
    const notReconciled = this.GetStatusLength(PaymentStatusEnum.NotReconciled, result);
    const queued = this.GetStatusLength(PaymentStatusEnum.Queued, result);

    this.myDictionary.Pending = pending;
    this.myDictionary.Submitted = submitted;
    this.myDictionary.Paid = paid;
    this.myDictionary.Rejected = rejected;
    this.myDictionary.Reconciled = reconciled;
    this.myDictionary['Not Reconciled'] = notReconciled;
    this.myDictionary.Qeued = queued;

    this.populateDataChart(this.myDictionary);
    this.hasData = true;
    this.isLoading = false;
  }

  GetStatusLength(paymentStatus: PaymentStatusEnum, result: PolicyPayment): number {
    return result.payments.filter(c => c.paymentStatus === paymentStatus).length;
  }

  populateDataChart(myDictionary: any) {
    // tslint:disable-next-line: forin
    for (const key in myDictionary) {
      const value = myDictionary[key];
      const keyString = key;
      if (value > 0) {
        this.piechartData.push(value);
        this.chartLabels.push(keyString);
      }
    }
  }


  // Setting the piechart and deactivating if no data
  setPageData(result: PolicyPayment) {
    if (result.payments.length > 0) {
      this.setPieChartData(result);
    } else {
      this.isLoading = false;
      this.hasData = false;
    }
  }

  addStartDate($event: any) {
    this.fromDate = $event.value._d;
    this.isToDateSelected = true;
    this.form.patchValue({
      endDate: '',
      endDateGroup: '',
    });
  }

  addEndDate($event: any) {
    this.toDate = $event.value._d;
    this.setChartByDate();
  }

  setChartByDate() {
    if (this.fromDate > this.toDate) {
      return;
    } else {
      this.clearChartDataAndLabels();

      const result = this.filteredPayments.filter(a => new Date(a.createdDate).setHours(0, 0, 0, 0) >= new Date(this.fromDate).setHours(0, 0, 0, 0)
        && new Date(a.createdDate).setHours(0, 0, 0, 0) <= new Date(this.toDate).setHours(0, 0, 0, 0));
      this.policyPayments.payments = result;
      this.totalPaymentsHeading = result.length;
      const policyPayment = new PolicyPayment();
      policyPayment.payments = result;
      this.totalAmountHeading = this.getAmount(policyPayment);
      this.filterHeading = `Filtered from ${this.datePipe.transform(this.fromDate, 'dd/MM/yyyy')} - ${this.datePipe.transform(this.toDate, 'dd/MM/yyyy')}`;

      this.setPageData(this.policyPayments);
      this.form.patchValue({
        endDate: '',
        startDate: '',
      });
    }
  }

  // This is the method being called when you click on the pie chart
  public chartClicked(e: any): void {
    if (e.active.length > 0) {
      const chart = e.active[0]._chart;
      const activePoints = chart.getElementAtEvent(e.event);
      if (activePoints.length > 0) {

        const clickedElementIndex = activePoints[0]._index;
        const labelName = chart.data.labels[clickedElementIndex];

        switch (labelName) {
          case PaymentStatusEnum[PaymentStatusEnum.Pending]:
            this.setTable(PaymentStatusEnum.Pending, labelName);
            break;
          case PaymentStatusEnum[PaymentStatusEnum.Submitted]:
            this.setTable(PaymentStatusEnum.Submitted, labelName);
            break;
          case PaymentStatusEnum[PaymentStatusEnum.Paid]:
            this.setTable(PaymentStatusEnum.Paid, labelName);
            break;
          case PaymentStatusEnum[PaymentStatusEnum.Rejected]:
            this.setTable(PaymentStatusEnum.Rejected, labelName);
            break;
          case PaymentStatusEnum[PaymentStatusEnum.Reconciled]:
            this.setTable(PaymentStatusEnum.Reconciled, labelName);
            break;
          case 'Not Reconciled':
            const awaitingDecision = 'Awaiting Decision';
            this.setTable(PaymentStatusEnum.NotReconciled, awaitingDecision);
            break;
          case PaymentStatusEnum[PaymentStatusEnum.Queued]:
            this.setTable(PaymentStatusEnum.Queued, labelName);
            break;
        }
      }
    }
  }

  // this is te method being called to populate the table in claim-table-dashboard
  setTable(paymentStatusEnum: PaymentStatusEnum, labelName: string) {
    switch (this.paymentType) {
      case PaymentTypeEnum.Commission:
        this.populateTable(this.commissionTable, paymentStatusEnum, labelName);
        break;
      case PaymentTypeEnum.Refund:
        this.populateTable(this.refundTable, paymentStatusEnum, labelName);
        break;
    }
  }

  populateTable(table: any, paymentStatusEnum: PaymentStatusEnum, labelName: string) {

    table.fillData(this.filteredPayments.filter(a => a.paymentStatus === paymentStatusEnum), `Individual ${labelName} Payments`);

  }
  public chartHovered(e: any): void { }

}
