import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { PagedUserRemindersDataSource } from './paged-user-reminders.datasource';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserTypeEnum } from 'projects/shared-models-lib/src/lib/enums/user-type-enum';

@Component({
  selector: 'paged-user-reminders',
  templateUrl: './paged-user-reminders.component.html',
  styleUrls: ['./paged-user-reminders.component.css'],
})
export class PagedUserRemindersComponent
  extends UnSubscribe
  implements OnInit, OnChanges {
  @Input() userId: number;

  // optional
  @Input() userReminderItemType: UserReminderItemTypeEnum;
  @Input() itemId: number;
  @Input() getAlerts = false;
  @Input() isBasicMode = false;
  @Input() inUserReminderTypes: UserReminderTypeEnum[];

  @Output() selectedUserReminderEmit: EventEmitter<UserReminder> = new EventEmitter();

  userType = UserTypeEnum.Internal;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject(
    'loading...please wait'
  );

  userReminderTypes: UserReminderTypeEnum[];

  dataSource: PagedUserRemindersDataSource;

  showUserReminder: boolean;
  showFilters: boolean;

  selectedUserReminders: UserReminder[];

  selectedUserReminderTypeFilter: UserReminderTypeEnum;
  selectedUsersFilter: User[];

  reminder = UserReminderTypeEnum.Reminder;
  message = UserReminderTypeEnum.Message;
  systemNotification = UserReminderTypeEnum.SystemNotification;

  form: UntypedFormGroup;

  isExpanded = false;
  triggerReset: boolean;

  constructor(
    private readonly userReminderService: UserReminderService,
    private readonly formBuilder: FormBuilder
  ) {
    super();
    this.userReminderTypes = this.inUserReminderTypes
      ? this.inUserReminderTypes
      : this.ToArray(UserReminderTypeEnum);
    this.dataSource = new PagedUserRemindersDataSource(
      this.userReminderService
    );
  }

  ngOnInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
    });
    this.dataSource.rowCount$.subscribe(
      (count) => (this.paginator.length = count)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userId || (this.userReminderItemType && this.itemId)) {
      this.createForm();
      this.getData();
    }
  }

  createForm(): void {
    if (this.form) {
      return;
    }
    this.form = this.formBuilder.group({
      userReminderTypeFilter: [{ value: null, disabled: false }],
    });
  }

  getData() {
    this.dataSource.userId = this.userId;
    this.dataSource.userReminderTypes = this.selectedUserReminderTypeFilter
      ? [this.selectedUserReminderTypeFilter]
      : this.userReminderTypes;
    this.dataSource.userReminderItemType = this.userReminderItemType;
    this.dataSource.itemId = this.itemId;
    this.dataSource.getAlerts = this.getAlerts;
    this.dataSource.selectedUsersFilter = this.selectedUsersFilter
      ? this.selectedUsersFilter
      : [];

    this.dataSource.getData(
      this.paginator.pageIndex + 1,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction,
      ''
    );
  }

  delete(userReminder: UserReminder) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('deleting notification...please wait');
    userReminder.isDeleted = true;
    this.userReminderService
      .updateUserReminder(userReminder)
      .subscribe((result) => {
        this.isLoading$.next(false);
        this.getData();
      });
  }

  selectAll() {
    if (!this.selectedUserReminders || this.selectedUserReminders.length <= 0) {
      this.dataSource.data.data.forEach((userReminder) => {
        if (!this.selectedUserReminders) {
          this.selectedUserReminders = [];
        }

        this.selectedUserReminders.push(userReminder);
      });
    } else {
      this.selectedUserReminders = [];
    }
  }

  deleteMultiple() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('updating notifications...please wait');
    this.selectedUserReminders.forEach((userReminder) => {
      userReminder.isDeleted = true;
    });

    this.userReminderService
      .updateUserReminders(this.selectedUserReminders)
      .subscribe((result) => {
        this.selectedUserReminders = [];
        this.isLoading$.next(false);
        this.getData();
      });
  }

  pauseAlert(userReminder: UserReminder) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('updating reminder...please wait');
    userReminder.alertDateTime = null;
    this.userReminderService
      .updateUserReminder(userReminder)
      .subscribe((result) => {
        this.isLoading$.next(false);
        this.getData();
      });
  }

  pauseAlertMultiple() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('updating reminders...please wait');
    this.selectedUserReminders.forEach((userReminder) => {
      userReminder.alertDateTime = null;
    });

    this.userReminderService
      .updateUserReminders(this.selectedUserReminders)
      .subscribe((result) => {
        this.selectedUserReminders = [];
        this.isLoading$.next(false);
        this.getData();
      });
  }

  startAlert(userReminder: UserReminder) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('updating reminder...please wait');
    userReminder.alertDateTime = new Date().getCorrectUCTDate();
    this.userReminderService
      .updateUserReminder(userReminder)
      .subscribe((result) => {
        this.isLoading$.next(false);
        this.getData();
      });
  }

  startAlerts() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('updating reminders...please wait');
    this.selectedUserReminders.forEach((userReminder) => {
      userReminder.alertDateTime = new Date().getCorrectUCTDate();
    });

    this.userReminderService
      .updateUserReminders(this.selectedUserReminders)
      .subscribe((result) => {
        this.selectedUserReminders = [];
        this.isLoading$.next(false);
        this.getData();
      });
  }

  view(userReminder: UserReminder) {
    this.selectedUserReminderEmit.emit(userReminder);
  }

  userReminderSelected(userReminder: UserReminder) {
    if (!this.selectedUserReminders) {
      this.selectedUserReminders = [];
    }

    let index = this.selectedUserReminders.findIndex(
      (a) => a.userReminderId === userReminder.userReminderId
    );
    if (index > -1) {
      this.selectedUserReminders.splice(index, 1);
    } else {
      this.selectedUserReminders.push(userReminder);
    }
  }

  isSelected($event: UserReminder): boolean {
    return !this.selectedUserReminders
      ? false
      : this.selectedUserReminders.some(
        (s) => s.userReminderId == $event.userReminderId
      );
  }

  getStartMultiple(): boolean {
    return this.selectedUserReminders.some((s) => s.alertDateTime === null);
  }

  getPauseMultiple(): boolean {
    return this.selectedUserReminders.some((s) => s.alertDateTime !== null);
  }

  userSelected($event: User[]) {
    this.isExpanded = false;
    this.selectedUsersFilter = $event;
    this.dataSource.selectedUsersFilter = this.selectedUsersFilter;

    if (this.selectedUsersFilter && this.selectedUsersFilter.length > 0) {
      this.dataSource.getData(
        this.paginator.pageIndex + 1,
        this.paginator.pageSize,
        this.sort.active,
        this.sort.direction,
        ''
      );
    }
  }

  userReminderTypeFilterChanged($event: UserReminderTypeEnum) {
    this.selectedUserReminderTypeFilter = this.userReminderTypes.find(
      (s) => s == $event
    );
    this.dataSource.userReminderTypes = [];
    this.dataSource.userReminderTypes.push(this.selectedUserReminderTypeFilter);

    this.dataSource.getData(
      this.paginator.pageIndex + 1,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction,
      ''
    );
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'selectMultiple', show: !this.isBasicMode },
      { def: 'userReminderType', show: true },
      { def: 'text', show: true },
      { def: 'createdBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
      { def: 'createdByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
      { def: 'createdDate', show: true },
      { def: 'actions', show: true },
    ];

    return columnDefinitions.filter((cd) => cd.show).map((cd) => cd.def);
  }

  getUserReminderType(userReminderType: UserReminderTypeEnum) {
    return this.formatText(UserReminderTypeEnum[userReminderType]);
  }

  reset() {
    this.isExpanded = false;
    this.selectedUsersFilter = [];

    this.dataSource.userReminderTypes = this.userReminderTypes;
    this.dataSource.selectedUsersFilter = this.selectedUsersFilter;

    this.form.controls.userReminderTypeFilter.reset();

    this.selectedUserReminders = [];
    this.selectedUserReminderTypeFilter = null;

    this.triggerReset = !this.triggerReset;

    this.getData();
  }

  formatText(text: string): string {
    return text && text.length > 0
      ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim()
      : 'No data';
  }

  ToArray(anyEnum: { [x: string]: any }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map((key) => anyEnum[key]);
  }
}
