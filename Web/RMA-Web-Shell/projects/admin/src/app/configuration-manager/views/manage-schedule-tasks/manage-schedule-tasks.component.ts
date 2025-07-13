import { ScheduledTask } from 'projects/admin/src/app/configuration-manager/shared/scheduled-task';
import { Component, OnInit } from '@angular/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ScheduledTasksService } from 'projects/admin/src/app/configuration-manager/shared/scheduled-task.service';
import { Router } from '@angular/router';
import { ScheduledTasksDataSource } from 'projects/admin/src/app/configuration-manager/views/manage-schedule-tasks/scheduled-tasks-list/scheduled-tasks-list.datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'manage-schedule-tasks',
  templateUrl: './manage-schedule-tasks.component.html',
  styleUrls: ['./manage-schedule-tasks.component.css']
})
export class ManageScheduleTasksComponent extends DetailsComponent implements OnInit {
  scheduledTasks: ScheduledTask[];
  scheduledTask: ScheduledTask;
  showHideDetails: number;
  minDate: Date;
  holidayDate: Date;
  mode: string;
  showEditBtn: number;
  frequency:number;
  isEnabled:boolean;
  hasPermission:boolean;
  taskFrequency:any[];
  enableList:any[];
  constructor(
      private readonly formBuilder: UntypedFormBuilder,
      private readonly scheduledTasksService: ScheduledTasksService,
      private readonly router: Router,
      public readonly dataSource: ScheduledTasksDataSource,
      appEventsManager: AppEventsManager,
      public readonly alertService: AlertService) {
      super(appEventsManager, alertService, router, 'Schedules Tasks', 'configuration-manager/', 0);

  }

  ngOnInit() {
    this.getTaskFrequencies();
    this.getBoolValues();
      this.showHideDetails = 1;
      this.showEditBtn = 0;
      this.createForm(0);
      this.hasPermission = userUtility.hasPermission('Edit Scheduled Task');
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnDestroy() {
  }

  createForm(id: any): void {
      // default date on create.
      const date =  new Date();
      this.form = this.formBuilder.group({
          id,
          category: new UntypedFormControl(''),
          description: new UntypedFormControl(''),
          retriesNumber: new UntypedFormControl(''),
          isEnabled: new UntypedFormControl(''),
          frequency: new UntypedFormControl('')
      });
  }

  readForm(): ScheduledTask {
      const scheduledTask = new ScheduledTask();

      return scheduledTask;
  }

  setForm(scheduledTask: ScheduledTask): void {
    // if(scheduledTask.scheduledTaskType.isEnabled == true){
    //   this.isEnabled = 1;
    // }else{
    //   this.isEnabled = 0;
    // }
    this.isEnabled = scheduledTask.scheduledTaskType.isEnabled;
    this.frequency = scheduledTask.taskScheduleFrequency;
      if (!this.form) { this.createForm(scheduledTask.scheduledTaskId); }
      this.form.controls.category.setValue(scheduledTask.scheduledTaskType.category);
      this.form.controls.description.setValue(scheduledTask.scheduledTaskType.description);
      this.form.controls.retriesNumber.setValue(scheduledTask.scheduledTaskType.numberOfRetriesRemaining);
      this.form.controls.isEnabled.setValue(scheduledTask.scheduledTaskType.isEnabled);
      this.form.controls.frequency.setValue(scheduledTask.taskScheduleFrequency);
      this.form.controls.frequency.patchValue(this.frequency)
      this.mode = 'Edit';
      this.scheduledTask = scheduledTask;
      this.showHideDetails = 2;
  }

  isEnabledChanged($event: any) {
    this.isEnabled = $event.value;
  }

  frequencyChanged($event: any) {
    this.frequency = $event.value as number;
  }

  save() {
      if (this.mode === 'Add') {
          // this.publicHoliday = new PublicHoliday();
          // this.publicHoliday.name = name;
          // this.publicHoliday.holidayDate = resDate;
          // this.publicHolidayService.addPublicHoliday(this.publicHoliday).subscribe(() => {
          //     this.form.disable();
          //     this.done('Holiday successfully saved.');
          // });
      }
      if (this.mode === 'Edit') {
          this.scheduledTask.scheduledTaskType.isEnabled = this.isEnabled;
        this.scheduledTask.taskScheduleFrequency = this.frequency;
          this.scheduledTasksService.editScheduledTask(this.scheduledTask).subscribe(() => {
              this.form.disable();
              this.done('Scheduled task successfully saved.');
          });
      }
      this.showHideDetails = 1;
  }

  edit(): void {
      //this.form.enable();
      this.showEditBtn = 0;
      this.form.get('isEnabled').enable();
      this.form.get('frequency').enable();
      this.form.get('retriesNumber').enable();
  }

  done(statusMesssage: string) {
      this.dataSource.isLoading = true;
      this.dataSource.getData();
      this.alertService.success(statusMesssage);
  }

  clear() {
      this.showHideDetails = 1;
  }

  // addNew() {
  //     this.createForm(0);
  //     // this.publicHoliday = new PublicHoliday();
  //     // this.showHideDetails = 2;
  //     // this.mode = 'Add';
  // }

  backToSearch() {
      this.router.navigate(['config-manager/']);
  }

  scheduleTaskChangeHandler(scheduledTask: ScheduledTask): void {
      this.showHideDetails = 2;
      this.mode = 'Edit';
      this.showEditBtn = 1;
      this.setForm(scheduledTask);
      this.form.disable();
  }

  getTaskFrequencies(): void {
    this.taskFrequency = [
      { Id: 1, Name: 'One Minutes', value: 'One Minutes' },
      { Id: 2, Name: 'Two Minutes', value: 'Two Minutes' },
      { Id: 3, Name: 'Five Minutes', value: 'Five Minutes' },
      { Id: 4, Name: 'Quarter Hourly', value: 'Quarter Hourly' },
      { Id: 5, Name: 'Half Hourly', value: 'Half Hourly' },
      { Id: 6, Name: 'Hourly', value: 'Hourly' },
      { Id: 7, Name: 'Daily', value: 'Daily' },
      { Id: 8, Name: 'Weekly', value: 'Weekly' },
      { Id: 9, Name: 'Monthly', value: 'Monthly' },
      { Id: 10, Name: 'Quarterly', value: 'Quarterly' },
      { Id: 11, Name: 'BiYearly', value: 'BiYearly' },
      { Id: 12, Name: 'Yearly', value: 'Yearly' },
      { Id: 13, Name: 'Once Off', value: 'Once Off' },
      { Id: 14, Name: 'Payment Submission Schedule', value: 'Payment Submission Schedule' }
    ];
  }

  getBoolValues(): void {
    this.enableList = [
      { Id: 1, Name: 'Enabled', value: true },
      { Id: 2, Name: 'Disabled', value: false }
    ];
  }

}

