import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { ErrorTypeEnum } from '../message-float-model/error-type-enum';

@Component({
  selector: 'app-message-float-dialog',
  templateUrl: './message-float-dialog.component.html',
  styleUrls: ['./message-float-dialog.component.css']
})
export class MessageFloatDialogComponent implements OnInit {

  errorMessage: BehaviorSubject<string> = new BehaviorSubject('');
  isSuccess = false;
  isWarning = false;
  isDanger = false;


  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<MessageFloatDialogComponent>,) { }

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
    this.isSuccess = this.data.errorType === ErrorTypeEnum.success;
    this.isWarning = this.data.errorType === ErrorTypeEnum.warning;
    this.isDanger = this.data.errorType === ErrorTypeEnum.danger;
  }
}
