import { Component, OnInit, EventEmitter, ViewChild, ElementRef, Output } from '@angular/core';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ScheduledTask } from '../../../shared/scheduled-task';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ScheduledTasksDataSource } from './scheduled-tasks-list.datasource';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ScheduledTasksService } from '../../../shared/scheduled-task.service';
import { PublicHoliday } from '../../../Shared/public-holiday';

@Component({
  selector: 'scheduled-tasks-list',
  templateUrl: './scheduled-tasks-list.component.html',
  styleUrls: ['./scheduled-tasks-list.component.css']
})
export class ScheduledTasksListComponent implements OnInit {
  displayedColumns = ['Category','Description', 'IsEnabled','numberOfRetries', 'Actions'];
  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  @Output() scheduledTaskEmit: EventEmitter<ScheduledTask> = new EventEmitter();
  constructor(public readonly dataSource: ScheduledTasksDataSource,
              private readonly router: Router, private readonly datePipe: DatePipe,
              private readonly confirmservice: ConfirmationDialogsService, public readonly alertService: AlertService,
              private readonly scheduledTasksService: ScheduledTasksService, ) {

  }

  ngOnInit() {
      this.getScheduledTasks();
  }

  getScheduledTasks(): void {
      this.dataSource.setControls(this.paginator, this.sort);
      this.dataSource.getData();
      this.dataSource.isLoading = false;
  }

  onSelect(scheduledTask: ScheduledTask): void {
      this.scheduledTaskEmit.emit(scheduledTask);
  }

  onDelete(scheduledTask: ScheduledTask): void {
      this.confirmservice.confirmWithoutContainer(' Delete', ' Are you sure you want to delete ' + scheduledTask.scheduledTaskType.description + ' task?', 'Center', 'Center', 'Yes', 'No').subscribe(
          result => {
              if (result === true) {
                  this.scheduledTasksService.deleteScheduledTask(scheduledTask).subscribe(res => {
                      this.done('Task deleted successfully');
                  });
              }
          });

  }

  done(statusMesssage: string) {
      this.alertService.success(statusMesssage, 'Success', true);
      // this.router.navigate(['fincare/billing-manager/declaration-list']);
      this.dataSource.isLoading = true;
      this.dataSource.getData();
  }

  applyFilter(filterValue: any) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}

