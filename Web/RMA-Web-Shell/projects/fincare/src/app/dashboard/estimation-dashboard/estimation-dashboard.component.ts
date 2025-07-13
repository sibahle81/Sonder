import { Component, OnInit, ViewChild } from '@angular/core';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { PaymentOverviewComponent } from '../fincare-dashboard/fincare-dashboard-widgets/payment-overview/payment-overview.component';
import { ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { PaymentService } from '../../payment-manager/services/payment.service';
@Component({
  selector: 'estimation-dashboard',
  templateUrl: './estimation-dashboard.component.html',
  styleUrls: ['./estimation-dashboard.component.css']
})
export class EstimationDashboardComponent implements OnInit {
  @ViewChild(PaymentOverviewComponent, { static: true }) refundPayments: PaymentOverviewComponent;
  refund = PaymentTypeEnum.Refund;
  commission = PaymentTypeEnum.Commission;
  
  chartType = 'bar';
  isLoading = false;
  ChartLegend = true;
  ChartOptions: ChartOptions = {
    scales: {
      xAxes: [{
        stacked: true
      }],
      yAxes: [
        {
          stacked: true,
          ticks: {
            stepSize: 1
          }
        }]
    },
    responsive: true,
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
          const label = `${ctx.dataset.data[ctx.dataIndex]}`;
          return label;
        },
      },
    }
  };
  public ChartPlugins = [pluginDataLabels];
  public barChartOptions: any = {
    responsive: true,
    scales: {
      xAxes: [{
        stacked: true
      }],
      yAxes: [{
        stacked: true
      }]
    }
  };
  public barChartType: string = 'bar';
  allChartsData: {
     industryName: string,
      chartLabels: string[], 
      chartDataset: { data: number[], label: string, stack: string }[] }[] = [];
  constructor(private paymentService: PaymentService) { }
  ngOnInit() {
    this.GetEstimatedPayments();
  }
  public chartHovered(e: any): void { }
  public GetEstimatedPayments() {
    this.isLoading = true;
    this.paymentService.GetEstimatedPayments().subscribe(result => {
      const Industries = result.data.reduce((accumulator, currentValue) => {
        if (accumulator.indexOf(currentValue.industryName) === -1) {
          accumulator.push(currentValue.industryName);
        }
        return accumulator;
      }, []);
      // this.barChartLabels = result.months;
      // result.data.forEach(Item => { this.barChartData.push({ data: Item.amount, label: Item.clientType, stack: '1' },) })
      Industries.forEach(industry => {
        const industryLevelData = result.data.filter(d => d.industryName == industry);
        this.allChartsData.push({
          industryName: industry,
          chartLabels: result.months,
          chartDataset: industryLevelData.map(i => { return { data: i.amount, label: i.clientType, stack: '1' } })
        });
      });
      this.isLoading = false;
    }, error => { this.isLoading = false; });
  }
}