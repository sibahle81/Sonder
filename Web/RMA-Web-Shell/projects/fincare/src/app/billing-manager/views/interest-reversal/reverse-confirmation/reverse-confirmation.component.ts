import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reverse-confirmation',
  templateUrl: './reverse-confirmation.component.html',
  styleUrls: ['./reverse-confirmation.component.css']
})
export class ReverseConfirmationComponent {
  showSubmit = true;
  constructor(
    public dialogRef: MatDialogRef<ReverseConfirmationComponent>) {
  }

  dismissDialog(): void {
    this.dialogRef.close(false);
  }

  continueReverse(): void {
    this.dialogRef.close(true);
  }
}
