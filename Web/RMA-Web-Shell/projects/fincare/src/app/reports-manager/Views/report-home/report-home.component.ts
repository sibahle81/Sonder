import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-report-home',
  templateUrl: './report-home.component.html'
})
export class ReportHomeComponent implements OnInit {
  selectedTabIndex = 0;
  constructor() { }

  ngOnInit() {
  }

}
