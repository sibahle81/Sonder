import { Component, OnInit } from '@angular/core';

declare interface RouteInfo {
  path: string;
  title: string;

}

export const ROUTES: RouteInfo[] = [
  { path: 'home', title: 'Home'},
  { path: 'ledger', title: 'Overpayment Ledger' },
  { path: 'history', title: 'Overpayment History'},
  { path: 'process-write-off', title: 'Proccess Annual Write-Off' },
  { path: 'write-off', title: 'Write-Offs'},

]

@Component({
  selector: 'app-overpayment-layout',
  templateUrl: './overpayment-layout.component.html',
  styleUrls: ['./overpayment-layout.component.css']
})
export class OverpaymentLayoutComponent implements OnInit {

  loadedTab = 'home';
  isLoading: boolean;
  tabItem!: any;

  constructor( ) {
    this.tabItem = ROUTES.filter(item => item);
  }

  ngOnInit(): void {

  }

  tabSelection(tab: string): void {
    this.loadedTab = tab;
  }

  changeLoading(val: boolean): void {
    this.isLoading = val;
  }


}
