import { Component, OnInit, ViewChild } from '@angular/core';
import { ClaimOverviewComponent } from '../claim-overview/claim-overview.component';
import { ClaimTeamProductivityComponent } from '../dashboards/claim-team-productivity/claim-team-productivity.component';
import { ClaimTurnaroundComponent } from '../dashboards/claim-turnaround/claim-turnaround.component';



@Component({
  selector: 'claim-dashboard',
  templateUrl: './claim-dashboard.component.html',
  styleUrls: ['./claim-dashboard.component.css']
})
export class ClaimDashboardComponent implements OnInit {

  @ViewChild('claim-overview', { static: false }) claimOverview: ClaimOverviewComponent;
  @ViewChild('claim-turnover', { static: false }) claimTurnaround: ClaimTurnaroundComponent;
  @ViewChild('claim-team-productivity', { static: false }) claimTeamProductivity: ClaimTeamProductivityComponent;
  constructor() { }

  ngOnInit() {

  }

}

