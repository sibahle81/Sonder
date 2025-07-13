import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './view-email-audit.component.html'
})
export class ViewEmailAuditDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ViewEmailAuditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  close(): void {
    this.dialogRef.close();
  }
}
