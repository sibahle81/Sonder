import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Constants } from 'projects/shared-utilities-lib/src/lib/pipe-formats/constants';

@Component({
  selector: 'app-dialog-backdate-confirmation',
  templateUrl: './dialog-backdate-confirmation.component.html',
  styleUrls: ['./dialog-backdate-confirmation.component.css']
})
export class DialogBackdateConfirmationComponent {
  newdate: Date;
  dateformat = Constants.dateFormat;
  constructor(
    public dialogRef: MatDialogRef<DialogBackdateConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.newdate = data.newdate;
  }

  dismissDialog(): void {
    this.dialogRef.close(false);
  }

  continueBackdate(): void {
    this.dialogRef.close(true);
  }
}
