import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.css']
})
export class ConfirmDeleteDialogComponent implements OnInit {
  type: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,

  ) {
    this.type = data.type;
  }

  ngOnInit() {
  }

  save() {
    this.dialogRef.close({
      delete: true
    });
  }

  cancel() {
    this.dialogRef.close({
      delete: false
    });
  }
}
