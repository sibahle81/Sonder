import { Component, Input, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormControl } from '@angular/forms';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { BrokerageService } from 'projects/clientcare/src/app/broker-manager/services/brokerage.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { DatePipe } from '@angular/common';
import { PaymentTableClaimsComponent } from '../payment-table-claims/payment-table-claims.component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { Constants } from 'projects/fincare/src/app/payment-manager/models/constants';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { PaymentsProductOverview } from 'projects/fincare/src/app/shared/models/payments-product-overview';
import { PaymentStatusEnum } from 'projects/fincare/src/app/shared/enum/payment-status-enum';

@Component({
  selector: 'prma-payment-overview',
  templateUrl: './prma-payment-overview.component.html',
  styleUrls: ['./prma-payment-overview.component.css']
})
export class PrmaPaymentOverviewComponent {

  @ViewChild(PaymentTableClaimsComponent, { static: true }) claimsPaymentTable: PaymentTableClaimsComponent;

  @Input() product: string = null;
  @Input() paymentStatus: PaymentStatusEnum = null;

  form: UntypedFormGroup;
  maxDate: Date
  isLoadingFilter: Boolean = false;
  isLoadingData: Boolean = false;
  totalAmount: number = 0;
  totalCount: number = 0;
  hasData: Boolean = false;
  coverTypes: number[] = [];
  brokerages: Lookup[] = [];
  schemes: ProductOption[] = [];
  data : PaymentsProductOverview[] = [];

  // Chart Details below
  public chartType = 'bar';
  public chartData: number[] = [ ];
  public pieChartLegend = false;
  public pieChartPlugins = [pluginDataLabels];
  public pieChartOptions: ChartOptions = {
    scales: {
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
          const label = `${ctx.dataset.data[ctx.dataIndex]}`; // This is the name: ${ctx.chart.data.labels[ctx.dataIndex]}
          return label;
        },
      },
    }
  };

  public chartLabels: Array<any> = [];

  public chartColors: Array<any> = [
    {
      backgroundColor: ['#E56D99', '#f59d38', '#a68e3f', '#e8e517', '#55bbbd', '#90e86b', '#ed5345'],
      hoverBackgroundColor: ['#e61c66', '#f5880c', '#a88613', '#e8e517', '#10e7eb', '#53e815', '#ed2513'],
      borderWidth: 1,
    }
  ];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly paymentService: PaymentService,
    private readonly brokerageService: BrokerageService,
    private readonly productOptionService: ProductOptionService,
    private readonly claimCareService: ClaimCareService,
    private lookupService: LookupService,
    public datePipe: DatePipe
  ) {
    this.createForm();  
  }

  createForm(): void {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    this.maxDate = endDate;
    this.form = this.formBuilder.group({
      startDate: new FormControl(startDate),
      endDate: new FormControl(endDate),
      searchBy: new FormControl(0),
      brokerName: new FormControl(),
      schemeName: new FormControl(),
    });
  }

  getCoverTypes() {
    if(this.product) {
      this.lookupService.getCoverTypesByProduct(this.product).subscribe(data => {
        this.coverTypes = data.map((ct:Lookup) => ct.id)
      });
    } else {
      this.lookupService.getCoverTypes().subscribe(data => {
        this.coverTypes = data.map((ct:Lookup) => ct.id)
      });
    }

    this.getData();
  }

  onSearchByFilterSelect($event: any) {
    if($event.value === 1) {
      this.getGroupBrokerages()
    }
    else if($event.value === 2) {
      this.getSchemes();
    } else {
      this.brokerages = [];
      this.schemes = [];
    }    
  }
  
  getGroupBrokerages() {
    this.isLoadingFilter = true;
    this.brokerageService.getBrokeragesByCoverTypeIds(this.coverTypes).subscribe(data => {
      this.brokerages = data;
      this.isLoadingFilter = false;
    });
  }

  getSchemes() {
    this.isLoadingFilter = true;
    this.productOptionService.GetProductOptionsByCoverTypeIds(this.coverTypes).subscribe(data => {
      this.schemes = data;
      this.isLoadingFilter = false;
    });
  }
  
  getData() {  
    let params = { 
      startDate: this.datePipe.transform(new Date(this.form.get('startDate').value), Constants.dateString),
      endDate: this.datePipe.transform(new Date(this.form.get('endDate').value), Constants.dateString),
      paymentStatusId: this.paymentStatus ? this.paymentStatus : 0,
      product: this.product,
      searchBy: this.form.get('searchBy').value,
      query: '' 
    };
    
    if(params.searchBy === 1) {      
      params.query = this.form.get('brokerName').value;
    }
    else  if(params.searchBy === 2) {
      params.query = this.form.get('schemeName').value;      
    }

    this.isLoadingData = true;
    this.data = [];

    this.paymentService.getPaymentsProductOverview(params.startDate, params.endDate, params.paymentStatusId, params.product, params.query)
      .subscribe(results => {
        this.data = results;
        this.isLoadingData = false;
        this.hasData = (this.data.length > 0);

        if(this.hasData) {
          this.totalAmount = this.data.map(amt => amt.totalAmount).reduce((prev, curr) => prev + curr);
          this.totalCount = this.data.map(c => c.count).reduce((prev, curr) => prev + curr);
          this.fillChart();
        }
    });    
  }

  fillChart() {
    this.chartLabels = this.data.map(d => d.paymentStatus);
    this.chartData = this.data.map(d => d.count);
  }
  
  clearData() {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    this.maxDate = endDate;

    this.form.patchValue({
      startDate: startDate,
      endDate: endDate,
      searchBy: 0,
      brokerName: '',
      schemeName: ''
    });

    this.brokerages = [];
    this.schemes= [];
    this.data = [];
    this.totalAmount = 0;
    this.totalCount = 0;
    this.hasData = false;
  }
  
  resetData() {
    this.clearData();
    this.getData();
  }

  public chartHovered(e: any): void { }
}
