import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './default-confirmation-dialog.component.html'
})
export class DefaultConfirmationDialogComponent {

  title = 'Confirmation'; // default title but can be overridden
  text = 'Are you sure you want to proceed?'; // default text but can be overridden
  showConfirmButton = true; // default is to show button but can be overridden

  constructor(
    public dialogRef: MatDialogRef<DefaultConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.title = data.title ? data.title : this.title;
    this.text = data.text ? data.text : this.text;
    this.showConfirmButton = data.showConfirmButton == true || data.showConfirmButton == false ? data.showConfirmButton : this.showConfirmButton;
  }

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
