import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
import { PenscareMonthEndService } from '../../../pensioncase-manager/services/penscare-month-end.service';
import { PensCareService } from '../../../pensioncase-manager/services/penscare.service';

@Component({
  selector: 'app-month-end-layout',
  templateUrl: './month-end-layout.component.html',
  styleUrls: ['./month-end-layout.component.css']
})
export class MonthEndLayoutComponent implements OnInit  {
  loadedTab = 'month-end-dates';
  isLoading = false;
  loadingMessage: string;

  constructor(
    private penscareMonthEndService: PenscareMonthEndService
  ) { }

  ngOnInit(): void {
  }

  loadMonthEndDates () {
    this.loadedTab = 'month-end-dates'
  }

  loadMonthEndHistory() {
    this.loadedTab = 'month-end-history';
  }

  loadIRP5Generator() {
    this.loadedTab = 'month-end-irp5';
  }

  loadMonthEndPreChecks() {
    this.loadedTab = 'month-end-pre-checks';
  }

  close() {

  }
}
