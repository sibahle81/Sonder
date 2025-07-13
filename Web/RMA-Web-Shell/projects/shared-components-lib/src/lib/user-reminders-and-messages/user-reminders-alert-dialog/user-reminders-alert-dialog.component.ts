import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserRemindersComponent } from '../user-reminders.component';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';

@Component({
  templateUrl: './user-reminders-alert-dialog.component.html',
  styleUrls: ['./user-reminders-alert-dialog.component.css']
})
export class UserRemindersAlertDialogComponent {

  userId: number;
  userReminderItemType: UserReminderItemTypeEnum;
  itemId: number;

  showView: boolean;
  selectedUserReminder: UserReminder;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UserRemindersComponent>
  ) {
    if (data) {
      this.userId = data.userId;
      this.userReminderItemType = data.userReminderItemType;
      this.itemId = data.itemId;
    }
  }

  viewUserReminder($event: UserReminder) {
    this.selectedUserReminder = $event;
    this.toggleView();
  }

  toggleView() {
    this.showView = !this.showView;
  }

  getUserReminderItemType(userReminderType: UserReminderItemTypeEnum): string {
    if (userReminderType) {
      return this.formatText(UserReminderItemTypeEnum[+userReminderType]);
    }
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  cancel() {
    if (this.showView) {
      this.reset();
    } else {
      this.dialogRef.close(null);
    }
  }

  reset() {
    this.showView = false;
  }
}
