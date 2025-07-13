import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { SharedErrorTypeEnum } from '../shared-error-type-enum';

@Component({
  selector: 'lib-shared-message-float-dialog',
  templateUrl: './shared-message-float-dialog.component.html',
  styleUrls: ['./shared-message-float-dialog.component.css']
})
export class SharedMessageFloatDialogComponent implements OnInit {

  errorMessage: BehaviorSubject<string> = new BehaviorSubject('');
  isSuccess = false;
  isWarning = false;
  isDanger = false;


  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<SharedMessageFloatDialogComponent>,) { }

  ngOnInit(): void {
    this.setMessage(this.data.message);
  }

  setMessage(message: string) {
    this.errorMessage.next(message);
    this.setColor();
    setTimeout(() => {
      this.dialogRef.close();
    }, 3000);
  }

  setColor() {
    this.isSuccess = this.data.errorType === SharedErrorTypeEnum.success;
    this.isWarning = this.data.errorType === SharedErrorTypeEnum.warning;
    this.isDanger = this.data.errorType === SharedErrorTypeEnum.danger;
  }
}

