import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { DatePipe } from '@angular/common';
import { PaymentType } from '../../models/payment-type';
import { PaymentStatus } from '../../models/payment-status';
import { FilterPaymentsRequest } from '../../models/filter-payments-request';
import { Payment } from '../../models/payment.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
 
//@dynamic
@Component({
  selector: 'app-payment-chart',
  templateUrl: './payment-chart.component.html',
  styleUrls: ['./payment-chart.component.css']
})
export class PaymentChartComponent implements OnInit {
  constructor(
    private readonly service: PaymentService,
    private readonly datePipe: DatePipe
  ) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;
  isEmpty = true;

  filterPaymentsRequest: any;
  start: any;
  end: any;
  @Input() paymentType = 0;

  paymentTypes = [
    new PaymentType(0, 'All'),
    new PaymentType(1, 'Claim'),
    new PaymentType(2, 'Commission'),
    new PaymentType(3, 'Refund')
  ];

  paymentStatuses = [
    new PaymentStatus(0, 'All'),
    new PaymentStatus(1, 'Pending'),
    new PaymentStatus(2, 'Submitted'),
    new PaymentStatus(3, 'Paid'),
    new PaymentStatus(4, 'Rejected'),
    new PaymentStatus(5, 'Reconciled'),
    new PaymentStatus(6, 'Not Reconciled'),
    new PaymentStatus(7, 'Queued')
  ];
  startDate: Date;
  endDate: Date;
  isLoading = false;

  // Chart
  title = 'Payments to Date';
  public type = 'bar';
  public labels: Array<string> = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC'
  ];
  public data = {};

  public options = {
    labels: {
      render: 'label'
    },
    responsive: true
  };

  public colors = [
    {
      // 1st Year.
      backgroundColor: 'rgba(77,83,96,0.2)'
    },
    {
      // 2nd Year.
      backgroundColor: 'rgba(30, 169, 224, 0.8)'
    }
  ];

  // events
  public chartClicked({
    event,
    active
  }: {
    event: MouseEvent;
    active: {}[];
  }): void {
    console.log(event, active);
  }

  public chartHovered({
    event,
    active
  }: {
    event: MouseEvent;
    active: {}[];
  }): void {
    console.log(event, active);
  }

  ngOnInit() {
    this.initializeFilters();
    this.getData(this.paymentType);
  }

  private initializeFilters() {
    this.getStartDate();
    this.getEndDate();
    this.filterPaymentsRequest = new FilterPaymentsRequest();
    this.filterPaymentsRequest.paymentType = this.paymentTypes.filter(
      x => x.id === 0
    )[0].id;
    this.filterPaymentsRequest.paymentStatus = this.paymentStatuses.filter(
      x => x.id === 0
    )[0].id;
    this.filterPaymentsRequest.startDate = this.start;
    this.filterPaymentsRequest.endDate = this.end;
  }

  private getEndDate() {
    this.endDate = new Date();
    this.endDate.setDate(this.endDate.getDate() + 1);
    this.end = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
  }

  private getStartDate() {
    this.startDate = new Date();
    this.startDate.setMonth(this.startDate.getMonth() - 6);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
  }

  private getData(paymentType: number) {
    this.isLoading = true;
    this.service
      .getPayments(
        paymentType,
        this.filterPaymentsRequest.paymentStatus,
        this.filterPaymentsRequest.claimType,
        this.filterPaymentsRequest.startDate,
        this.filterPaymentsRequest.endDate
      )
      .subscribe(
        data => {
          if ((data !== null || data !== undefined) && data.length > 0) {
            this.getChartData(data);
          }

          this.isLoading = false;
        },
        err => {
          console.log(err);

          this.isLoading = false;
        }
      );
  }

  private getChartData(data: Payment[]) {
    if (data === null) {
      return data;
    } else {
      this.isEmpty = data.filter(x => x.paymentType === 1 || x.paymentType === 2 || x.paymentType === 3).length > 0;

      this.data = {
        labels: this.getYearToDateMonths().map(i => i.monthString),
        datasets: [
          {
            label: 'Claims',
            data: this.getMonthlyPaymentAmount(
              data.filter(x => x.paymentType === 1 && x.paymentStatus === 3)
            ),
            backgroundColor: [
              'rgba(255, 206, 86, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(255, 206, 86, 0.5)'
            ],
            borderColor: ['rgba(255, 206, 86, 1)'],
            borderWidth: 1
          },
          {
            label: 'Commissions',
            data: this.getMonthlyPaymentAmount(
              data.filter(x => x.paymentType === 2 && x.paymentStatus === 3)
            ),
            backgroundColor: [
              'rgba(54, 162, 235, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(54, 162, 235, 0.5)'
            ],
            borderColor: ['rgba(54, 162, 235, 1)'],
            borderWidth: 1
          },
          {
            label: 'Refunds',
            data: this.getMonthlyPaymentAmount(
              data.filter(x => x.paymentType === 3 && x.paymentStatus === 3)
            ),
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 99, 132, 0.5)'
            ],
            borderColor: ['rgba(255, 99, 132, 1)'],
            borderWidth: 1
          }
        ]
      };
    }
  }

  private getYearToDateMonths(): [{ date: Date; monthString: string }] {
    const currentDate = new Date();
    let months: [{ date: Date; monthString: string }];

    const lastMonth: number = currentDate.getDate() >= 25 ? 0 : 0;

    for (let i = lastMonth === 1 ? 12 : 11; i >= lastMonth; i--) {
      const tempDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        currentDate.getDate() > 28 ? 28 : currentDate.getDate()
      );

      if (months === undefined || months === null) {
        months = [
          {
            date: tempDate,
            monthString:
              tempDate.toLocaleString('en', { month: 'short' }) +
              '-' +
              tempDate.getFullYear()
          }
        ];
      } else {
        months.push({
          date: tempDate,
          monthString:
            tempDate.toLocaleString('en', { month: 'short' }) +
            '-' +
            tempDate.getFullYear()
        });
      }
    }

    return months;
  }

  private getMonthlyPaymentAmount(data: Payment[]): number[] {
    const amounts: number[] = new Array(0);

    this.getYearToDateMonths()
      .map(i => i.date)
      .forEach(date => {
        const paymentFirstDate = new Date(
          new Date().getFullYear(),
          date.getMonth(),
          1
        );
        const paymentLastDate = new Date(
          new Date().getFullYear(),
          date.getMonth() + 1,
          0
        );

        const amount = data
          .filter(
            x =>
              new Date(x.createdDate) >= paymentFirstDate &&
              new Date(x.createdDate) <= paymentLastDate
          )
          .map(i => i.amount)
          .reduce((a, b) => a + b, 0);

        amounts.push(amount);
      });

    return amounts;
  }
}
