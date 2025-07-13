import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';
@Component({
  selector: 'app-action-dialog',
  templateUrl: './action-dialog.component.html',
  styleUrls: ['./action-dialog.component.css']
})
export class ActionDialogComponent implements OnInit {
  isSpinner: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogActionRef: MatDialogRef<ActionDialogComponent>,
  ) { }

  ngOnInit(): void {

  }
  deleteAction(): void {
    this.dialogActionRef.close({ key: DataResponseEnum.Success });
  }
  closeDialog(): void {
    this.dialogActionRef.close();
  }
}
