import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserRemindersComponent } from '../user-reminders.component';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { UserTypeEnum } from 'projects/shared-models-lib/src/lib/enums/user-type-enum';

@Component({
  templateUrl: './user-reminders-dialog.component.html',
  styleUrls: ['./user-reminders-dialog.component.css']
})
export class UserRemindersDialogComponent implements OnInit {

  userId: number;
  userReminderItemType: UserReminderItemTypeEnum;
  itemId: number;

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  showForm: boolean;
  showView: boolean;
  showSearch: boolean;

  supportedUserReminderTypes: UserReminderTypeEnum[] = [UserReminderTypeEnum.Message, UserReminderTypeEnum.Reminder];

  selectedUserReminderType: UserReminderTypeEnum;
  selectedUserReminder: UserReminder;
  selectedUsers: User[];

  message = UserReminderTypeEnum.Message;
  reminder = UserReminderTypeEnum.Reminder;
  currentUser: User;

  userType = UserTypeEnum.Internal;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UserRemindersComponent>,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly userReminderService: UserReminderService
  ) {
    if (data) {
      this.userId = data.userId;
      this.userReminderItemType = data.userReminderItemType;
      this.itemId = data.itemId;
    }
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      userReminderType: [{ value: null, disabled: false }, [Validators.required]],
      text: [{ value: null, disabled: false }, [Validators.required, Validators.minLength(3), Validators.maxLength(250)]],
      alertDateTime: [{ value: null, disabled: false }],
    });

    this.isLoading$.next(false);
  }

  readForm(): UserReminder[] {
    const userReminders: UserReminder[] = [];

    if (this.selectedUserReminderType == UserReminderTypeEnum.Message) {
      this.selectedUsers.forEach(user => {
        const userReminder = new UserReminder();
        userReminder.userReminderType = this.selectedUserReminderType;
        userReminder.text = this.form.controls.text.value;
        userReminder.assignedByUserId = this.authService.getCurrentUser().id;
        userReminder.assignedToUserId = user.id;
        userReminder.alertDateTime = new Date().getCorrectUCTDate();

        userReminders.push(userReminder);
      });
    } else {
      const userReminder = new UserReminder();
      userReminder.userReminderType = this.selectedUserReminderType;
      userReminder.text = this.form.controls.text.value;
      userReminder.assignedByUserId = this.authService.getCurrentUser().id;
      userReminder.assignedToUserId = userReminder.assignedByUserId;
      userReminder.alertDateTime = this.selectedUserReminderType === UserReminderTypeEnum.Reminder ? new Date(this.form.controls.alertDateTime.value) : null;

      userReminders.push(userReminder);
    }

    return userReminders;
  }

  usersSelected($event: User[]) {
    this.selectedUsers = $event;
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  toggleView() {
    this.showView = !this.showView;
  }

  save() {
    this.isLoading$.next(true);

    const userReminders = this.readForm();
    this.userReminderService.createUserReminders(userReminders).subscribe(result => {
      if (result) {
        this.reset();
        this.isLoading$.next(false);
      }
    });
  }

  cancel() {
    if (this.showForm || this.showView) {
      this.reset();
    } else {
      this.dialogRef.close(null);
    }
  }

  viewUserReminder($event: UserReminder) {
    this.selectedUserReminder = $event;
    this.toggleView();
  }

  userReminderTypeChanged(userReminderType: UserReminderTypeEnum) {
    this.selectedUserReminderType = userReminderType;
    this.showSearch = userReminderType === UserReminderTypeEnum.Message;
  }

  reset() {
    this.form.reset();
    this.selectedUserReminderType = null;
    this.selectedUserReminder = null;
    this.selectedUsers = [];

    this.showForm = false;
    this.showView = false;
    this.showSearch = false;
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  getUserReminderType(userReminderType: UserReminderTypeEnum): string {
    if (userReminderType) {
      return this.formatText(UserReminderTypeEnum[+userReminderType]);
    }
  }

  getUserReminderItemType(userReminderType: UserReminderItemTypeEnum): string {
    if (userReminderType) {
      return this.formatText(UserReminderItemTypeEnum[+userReminderType]);
    }
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
