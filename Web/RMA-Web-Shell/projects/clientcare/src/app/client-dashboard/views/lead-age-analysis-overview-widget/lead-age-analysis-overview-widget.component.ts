import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { LeadService } from 'projects/clientcare/src/app/lead-manager/services/lead.service';
import { BehaviorSubject } from 'rxjs';
import { Dashboard } from 'projects/clientcare/src/app/policy-manager/shared/entities/dashboard/dashboard';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Lead } from '../../../lead-manager/models/lead';
import { Constants } from 'projects/claimcare/src/app/constants';
import { LeadClientStatusEnum } from '../../../policy-manager/shared/enums/leadClientStatusEnum';
import { LeadDetails } from '../../../lead-manager/models/lead-details';
import { Router } from '@angular/router';
import { ClientTypeEnum } from '../../../policy-manager/shared/enums/client-type-enum';

@Component({
  selector: 'app-lead-age-analysis-overview-widget',
  templateUrl: './lead-age-analysis-overview-widget.component.html',
  styleUrls: ['./lead-age-analysis-overview-widget.component.css']
})
export class LeadAgeAnalysisOverviewWidgetComponent implements OnInit {

  @Input() refresh: any;

  dataSource: MatTableDataSource<Lead>;

  displayedColumns: string[] = ['clientType', 'createdDate', 'leadClientStatus', 'displayName', 'productsInterestedCount', 'slaCompare', 'actions'];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  isLoading$ = new BehaviorSubject(true);
  data: any[] = [];
  lables: any[] = [];

  dashboardData: Dashboard[] = [];
  showTableData = false;
  expanded = false;

  public barChartOptions: ChartOptions = {
    responsive: true,
  };

  public barChartLabels: Label[];
  public chartType: ChartType = 'pie';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[];
  totalNoOfLeads = 0;
  totalZeroToThirtyDays = 0;
  totalThirtyToSixtyDays = 0;
  totalOverSixtyDays = 0;

  constructor(
    private readonly leadService: LeadService,
    public router: Router
  ) { }

  ngOnInit() {
    this.getData();
    this.dataSource = new MatTableDataSource<Lead>();
  }


  getData() {
    this.isLoading$.next(true);

    this.leadService.GetLeadsAgeAnalysis().subscribe(result => {
      this.dashboardData = result ? result : [];
      this.setGraphInputs();
      this.isLoading$.next(false);
    });
  }

  setGraphInputs() {
    this.barChartLabels = [];
    const noOfLeads = [];

    this.dashboardData.forEach(s => {
      this.barChartLabels.push(s.leadStatus);
      noOfLeads.push(s.numberOfLeads);
      this.totalNoOfLeads += s.numberOfLeads;
    });

    this.barChartData = [
      { data: noOfLeads, label: 'No of Leads', stack: 'a' }
    ];

  }

  export() {
    this.download();
  }

  download() {
    const csvData = this.ConvertToCSV(this.dashboardData);
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    const x: Date = new Date();
    const link: string = 'LeadAgeAnalysisOverview' + '_' + x.getFullYear() + '-' + x.getMonth() + '-' + x.getDay() + '.csv';
    a.download = link.toLocaleLowerCase();
    a.click();
  }

  ConvertToCSV(objArray) {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';

    // tslint:disable-next-line:forin
    for (const index1 in objArray[0]) {
      row += index1 + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < array.length; i++) {
      let line = '';
      // tslint:disable-next-line:forin
      for (const index in array[i]) {
        if (line !== '') {
          line += ',';
        }

        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return str;
  }

  toggle() {
    this.showTableData = !this.showTableData;
  }

  togglePanel() {
    this.expanded = !this.expanded;
  }

  public chartClicked(e: any): void {
    if (e.active.length > 0) {
      const chart = e.active[0]._chart;
      const activePoints = chart.getElementAtEvent(e.event);
      if (activePoints.length > 0) {
        const clickedElementIndex = activePoints[0]._index;
        const labelName = chart.data.labels[clickedElementIndex];
        switch (labelName) {
          case Constants.AgeAnalysisZeroToThirtyDays:
            this.setTable(Constants.AgeAnalysisZeroToThirtyDays);
            break;
          case Constants.AgeAnalysisThirtyToSixtyDays:
            this.setTable(Constants.AgeAnalysisThirtyToSixtyDays);
            break;
          case Constants.AgeAnalysisOverSixtyDays:
            this.setTable(Constants.AgeAnalysisOverSixtyDays);
            break;
        }
      }
    }
  }

  // TODO
  setTable(quoteAgeAnalysis: string) {
    this.leadService.GetLeadListByRange(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, quoteAgeAnalysis).subscribe(results => {
      this.dataSource = new MatTableDataSource(results.data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

    });
  }

  onSelected(item: LeadDetails): void {
    this.router.navigate([`/clientcare/lead-manager/manage-lead/${item.leadId}`]);
  }

  getClientType(clientType: number): string {
    const statusText = ClientTypeEnum[clientType];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

  getLeadStatus(leadStatus: number): string {
    const statusText = LeadClientStatusEnum[leadStatus];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

}
