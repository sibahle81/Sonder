import { Component, ElementRef, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service'
import { ChartOptions } from 'chart.js';
import { ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { EncryptionUtility } from 'projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility';

interface assign {
  userName: string
  id: string
  email: string
}
export interface UserAccess {
authenticationTypeId: string;
email: string;
exp: number
iat: number;
ipdAddress: string;
isinternaluser: string;
iss: string;
jti: string;
name: string;
nbf: number;
portalTypeId: string;
role: string;
roleId: string;
sub: string;
tenantId: string;
token: string;
token_usage: string;
username: string;
}
@Component({
  selector: 'app-dasboard-charts',
  templateUrl: './dasboard-charts.component.html',
  styleUrls: ['./dasboard-charts.component.css']
})
export class DasboardChartsComponent implements OnInit {
  public doughnutChartLabels: string[] = [];
  public demodoughnutChartData: number[] = [];
  public doughnutChartType: string = 'doughnut';
  public yAxisTicks: number[] = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  public barChartData: any[] = [];

  public doughnutChartColors: Array<any> = [
    {
      backgroundColor: ['rgba(125, 192, 218, 1)', 'rgba(54, 198, 1, 1)', 'rgba(255, 124, 124, 1)', 'rgba(226, 226, 226, 1)', 'rgba(335, 104, 114, 1)', 'rgba(205, 154, 124, 1)', 'rgba(295, 184, 14, 1)', 'rgba(258, 144, 194, 1)', 'rgba(25, 14, 104, 1)'],
      borderColor: ['rgba(125, 192, 218, 1)', 'rgba(54, 198, 1, 1)', 'rgba(255, 124, 124, 1)', 'rgba(226, 226, 226, 1)', 'rgba(255, 124, 124, 1)'],
      hoverBackgroundColor: ['rgba(125, 192, 218, 0.9)', 'rgba(54, 198, 1, 0.9)', 'rgba(255, 124, 124, 0.9)', 'rgba(226, 226, 226, 0.9)', 'rgba(255, 124, 124, 0.9)'],
      hoverBorderColor: ['rgba(125, 192, 218, 1)', 'rgba(54, 198, 1, 1)', 'rgba(255, 124, 124, 1)', 'rgba(226, 226, 226, 1)', 'rgba(255, 124, 124, 1)'],
    }
  ];

  public doughnutChartOptions: ChartOptions = {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 10,
      },
    }
  };
  public barChartOptions: any = {
    scales: {
      xAxes: [{
        display: false,
        ticks: {
          beginAtZero: true
        },
        position: 'bottom',
        barPercentage: 0.8,
        categoryPercentage: 0.8
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
        }
      }]
    },
    responsive: true,
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 10,
      },
    },
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => {
          return data.datasets[tooltipItem[0].datasetIndex].label;
        },
        label: (tooltipItem, data) => {
          return `Value: ${tooltipItem.yLabel}`;
        },
      },
    },
  };

  public mbarChartLabels: string[] = [];
  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;

  public barChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(125, 192, 218, 1)',
      borderColor: 'rgba(25, 192, 218,1)',
      pointBackgroundColor: 'rgba(25, 192, 218,1)',
      pointBorderColor: '#fafafa',
      pointHoverBackgroundColor: '#fafafa',
      pointHoverBorderColor: 'rgba(25, 192, 218)'
    },
    {
      backgroundColor: 'rgba(54, 198, 1, 1)',
      borderColor: 'rgba(54, 198, 1,1)',
      pointBackgroundColor: 'rgba(54, 198, 1,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(54, 198, 1,1)'
    },
    {
      backgroundColor: 'rgba(255, 124, 124, 1)',
      borderColor: 'rgba(255, 124, 124,1)',
      pointBackgroundColor: 'rgba(255, 124, 124,1)',
      pointBorderColor: '#fafafa',
      pointHoverBackgroundColor: '#fafafa',
      pointHoverBorderColor: 'rgba(255, 124, 124)'
    },
    {
      backgroundColor: 'rgba(226, 226, 226, 1)',
      borderColor: 'rgba(226, 226, 226,1)',
      pointBackgroundColor: 'rgba(226, 226, 226,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(226, 226, 226,1)'
    },

    {
      backgroundColor: 'rgba(335, 104, 114, 1)',
      borderColor: 'rgba(226, 226, 226,1)',
      pointBackgroundColor: 'rgba(226, 226, 226,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(226, 226, 226,1)'
    },
    {
      backgroundColor: 'rgba(205, 154, 124, 1)',
      borderColor: 'rgba(226, 226, 226,1)',
      pointBackgroundColor: 'rgba(226, 226, 226,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(226, 226, 226,1)'
    },
    {
      backgroundColor: 'rgba(295, 184, 14, 1)',
      borderColor: 'rgba(226, 226, 226,1)',
      pointBackgroundColor: 'rgba(226, 226, 226,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(226, 226, 226,1)'
    },
    {
      backgroundColor: 'rgba(25, 14, 104, 1)',
      borderColor: 'rgba(226, 226, 226,1)',
      pointBackgroundColor: 'rgba(226, 226, 226,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(226, 226, 226,1)'
    },
    {
      backgroundColor: 'rgba(226, 226, 226, 1)',
      borderColor: 'rgba(226, 226, 226,1)',
      pointBackgroundColor: 'rgba(226, 226, 226,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(226, 226, 226,1)'
    }
  ];
  public selectedDays: number = 30;
  selectedDaysLabel: string;
  userAccess:UserAccess;
  jsonData = [];
  isSpinner: boolean = false;
  filteredAssignList= [];
  assignList: assign[] = [];
  public selectedAgentID: string = "0";
  hasAccess: boolean = false;
  displayDropdown:boolean=false
  @ViewChild('agentSelect') agentSelect: MatSelect;
  searchTerm: string;
  selectedOptionUsername:string;
  @ViewChild('selectedAgent', { static: true }) selectedAgent: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocomplete) auto: MatAutocomplete;

  constructor(private dashboardService: DashboardService) { }
  ngOnInit() {
    this.getAuthPermission();
    this.checkPermissions();
    this.getAgentList();
    this.fetchData();
    this.selectedDaysLabel = this.getSelectedDaysLabel(this.selectedDays); 
    this.selectedAgentID = this.getDefaultAgentID();
    this.selectedOptionUsername = this.displaySelectedOption();
    this.filteredAssignList=[...this.assignList]
  }
  checkPermissions(): void {
    this.hasAccess = userUtility.hasPermission('Debtor Listing for Team Leader'); 
  }
  getAuthPermission(){
    this.userAccess = JSON.parse(EncryptionUtility.decryptData(sessionStorage.getItem('auth-profile')));
    const allowedRoles = ['Debtor Collection Agent', 'Collection Agent'];
    this.hasAccess = allowedRoles.includes(this.userAccess.role);

    if (this.hasAccess) {
      this.displayDropdown=true;
    } else {
      this.displayDropdown=false;
    }  }
  fetchData(): void {
    this.fetchApiData(this.selectedAgentID, this.selectedDays);
    this.updateChartData(this.selectedAgentID);
  }
  fetchApiData(selectedAgentID: string, selectedDays: number): void {
    this.isSpinner = true;
    selectedAgentID=this.selectedAgentID;
    this.dashboardService.getChartData(selectedAgentID, this.selectedDays).subscribe(
      (apiResponse: any) => {
        this.jsonData = [
          { name: 'All Accounts', value: apiResponse?.data[0].allData || 0 },
          { name: 'Overdue Accounts', value: apiResponse?.data[0].ongoingData || 0 },
          { name: 'Pending', value: apiResponse?.data[0].pendingData || 0 },
          { name: 'New Accounts', value: apiResponse?.data[0].openData || 0 },
          { name: 'Closed', value: apiResponse?.data[0].closedData || 0 },
        ];
        this.isSpinner = false;
        this.selectedAgentID = selectedAgentID
      });
  }
  updateChartData(selectedAgentID: string): void {
    this.isSpinner = true;
    selectedAgentID=this.selectedAgentID;
    this.dashboardService.getChartGraphData(selectedAgentID, this.selectedDays).subscribe((data) => {
      this.mbarChartLabels = data.data.map(item => `${item.collectionStatusName} (${item.percentageCountPerStatus}%)`);
      this.barChartData = data?.data.map(item => {
        return {
          data: [item.noOfRecordIndividual],
          label: `${item.collectionStatusName} (${item.percentageCountPerStatus}%)`,
        };
      });

      this.doughnutChartLabels = this.mbarChartLabels;
      this.demodoughnutChartData = data?.data.map(item => item.noOfRecordIndividual);
      this.isSpinner = false;

    });
  }

  public onDaysChange(selectedDays: string): void {
    this.selectedDaysLabel = this.getSelectedDaysLabel(this.selectedDays);
    selectedDays=this.selectedDaysLabel;
    this.fetchData();
  }
  getAgentList(): void {
    this.dashboardService.getAssignAgentList().subscribe((res) => {
      if (res) {
        this.assignList = res['data'];
        this.filteredAssignList=[...this.assignList]
        if (!this.hasAccess && this.userAccess) {
          const user = this.assignList.find(item => item.email === this.userAccess.email);
          if (user) {
            this.selectedAgentID = user.id;
          }
        } else {
          this.selectedAgentID = '0';
        }
        this.fetchData();

      }
    });
  }
  getUserEmail(): string {
    return this.userAccess?.name || '';
  }
  
  onAgentSelect(selectedAgentID: string) {
    this.selectedAgentID = selectedAgentID; 
    this.selectedOptionUsername = selectedAgentID === '0' ? 'All' : this.assignList.find(item => item.id === selectedAgentID)?.userName || '';
    this.fetchData();
  }
  getDefaultAgentID(): string {
    if (!this.hasAccess && this.userAccess) {
      const user = this.assignList.find(item => item.email === this.userAccess.email);
      return user ? user.id : '0';
    } else {
      return '0';
    }
  }
  onInputBlur() {
    setTimeout(() => {
      if (!this.agentSelect.value) {
        this.displayDropdown = false;
      }
    }, 200);
  }
  onInputFocus() {
    this.displayDropdown = true;
    this.filteredAssignList=[...this.assignList]
  }
  filterAssignList(searchTerm: string): void {
    this.searchTerm = searchTerm; 
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredAssignList = this.assignList.slice();
    } else {
      this.filteredAssignList = this.assignList.filter(item =>
        item.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

  }
  displayUserName(user: assign): string {
    return user ? user.userName : '';
  }
  getSelectedDaysLabel(selectedDays: number): string {
    switch (selectedDays) {
      case 7:
        return 'Last 7 days';
      case 30:
        return 'Last 30 days';
      case 90:
        return 'Last 90 days';
      default:
        return '';
    }
  }
  getDisplayValue(): string {
    if (!this.hasAccess) {
      return this.getUserEmail();
    } else {
      if (this.selectedAgentID === '0') {
        return 'All';
      } else {
        const agent = this.assignList.find(item => item.id === this.selectedAgentID);
        return agent ? agent.userName : '';
      }
    }
  }
  
  displaySelectedOption(): string {
    if (!this.hasAccess) {
      return this.getUserEmail();
    } else {
      if (this.selectedAgentID === '0') {
        return 'All';
      } else {
        const selectedAgent = this.assignList.find(item => item.id === this.selectedAgentID);
        return selectedAgent ? selectedAgent.userName : '';
      }
    }
  }
}
