import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './view-recipients-dialog.component.html'
})
export class ViewRecipientsDialogComponent {

  title = 'Recipients'; // default title but can be overridden

  constructor(
    public dialogRef: MatDialogRef<ViewRecipientsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.title = data.title ? data.title : this.title;
  }

  resend() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
