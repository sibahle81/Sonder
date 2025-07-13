import { KeyValue } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './role-player-contact-options-dialog.component.html'
})
export class RolePlayerContactOptionsDialogComponent {

  title = 'Contact Options'; // default title but can be overridden

  constructor(
    public dialogRef: MatDialogRef<RolePlayerContactOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.title = data.title ? data.title : this.title;

    if (this.data.rolePlayerContactOptions?.length == 1) {
      this.rolePlayerContactOptionSelected(this.data.rolePlayerContactOptions[0]);
    }
  }

  rolePlayerContactOptionSelected($event: KeyValue<string, number>) {
    this.dialogRef.close($event.value);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
