import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './email-audit-dialog.component.html'
})
export class EmailAuditDialogComponent {

  title = 'View Email'; // default title but can be overridden

  constructor(
    public dialogRef: MatDialogRef<EmailAuditDialogComponent>,
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
