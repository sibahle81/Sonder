import { Component, OnInit } from '@angular/core';

declare interface RouteInfo {
  path: string;
  title: string;
}

export const ROUTES: RouteInfo[] = [
  { path: 'home', title: 'Home'},
  { path: 'history', title: 'Annual Increase History'},
  { path: 'bonus-payments-list', title: 'Bonus Payments' },
]

@Component({
  selector: 'app-month-end-layout',
  templateUrl: './annual-increase-layout.component.html',
  styleUrls: ['./annual-increase-layout.component.css']
})
export class AnnualIncreaseLayoutComponent implements OnInit  {
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
