import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';

@Component({
  selector: 'app-claim-notification-dialog',
  templateUrl: './claim-notification-dialog.component.html',
  styleUrls: ['./claim-notification-dialog.component.css'],
})
export class ClaimNotificationDialogComponent {

  selectedUserReminder: UserReminder;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ClaimNotificationDialogComponent>
  ) {
    if(data)
    {
      this.selectedUserReminder = data?.selectedUserReminder;
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
