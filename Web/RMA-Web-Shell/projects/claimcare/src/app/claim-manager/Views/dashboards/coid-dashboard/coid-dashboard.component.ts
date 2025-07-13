import { Component, OnInit, ViewChild } from '@angular/core';
import { StmOverviewComponent } from '../stm-overview/stm-overview.component';
import { VopdOverviewComponent } from '../vopd-overview/vopd-overview.component';
import { KeyValue } from '@angular/common';


@Component({
  selector: 'coid-dashboard',
  templateUrl: './coid-dashboard.component.html',
  styleUrls: ['./coid-dashboard.component.css']
})
export class CoidDashboardComponent implements OnInit {

  @ViewChild('vopd-overview', { static: false }) claimOverview: VopdOverviewComponent;
  @ViewChild('stm-turnover', { static: false }) claimTurnaround: StmOverviewComponent;

  dashboardLinks: KeyValue<string, string>[] = [
    { key: 'CLA-R134 Claims Management Dashboard (Power BI)', value: 'https://app.powerbi.com/groups/me/reports/5b07fbf9-af91-4319-baa0-071be20be38b/ReportSection9e7889744b033a92e56e?ctid=b62dfdbe-fc6e-492a-9d8a-9bda1edcc97c&experience=power-bi' },
    { key: 'RMA Reports (Data Warehouse)', value: 'http://azp-comp-bi-01/Reports/browse/RMADW' }
  ]
  constructor() { }

  ngOnInit() {

  }

}

