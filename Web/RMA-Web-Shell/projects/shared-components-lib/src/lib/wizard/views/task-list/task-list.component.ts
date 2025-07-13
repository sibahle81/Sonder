import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Wizard } from '../../shared/models/wizard';
import { TaskListDataSource } from './task-list.datasource';
import { ListComponent } from '../../../list-component/list.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent extends ListComponent implements OnInit {
  placeHolder = 'Filter tasks by name';
  searchText: string;
  constructor(
    alertService: AlertService,
    router: Router,
    dataSource: TaskListDataSource
  ) {
    super(alertService, router, dataSource, 'detailsUrl', 'Task', 'Tasks');
  }

  get isLoading(): boolean {
    return this.dataSource.isLoading;
  }

  ngOnInit() {
    super.ngOnInit();
  }

  setupDisplayColumns(): void {
    this.columns = [
      { columnDefinition: 'name', header: 'Name', cell: (row: Wizard) => row.name },
      { columnDefinition: 'type', header: 'Type', cell: (row: Wizard) => row.type },
      { columnDefinition: 'wizardStatusText', header: 'Status', cell: (row: Wizard) => row.wizardStatusText }
    ];
  }

  viewTask(item: Wizard): void {
    Wizard.redirect(this.router, item.type, item.id);
  }

  applyFilter(filterValue: any) {
    if (this.dataSource) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
      this.dataSource.paginator.firstPage();
    }
  }

  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
  }

  searchData(data) {
    this.applyFilter(data);
  }
}
