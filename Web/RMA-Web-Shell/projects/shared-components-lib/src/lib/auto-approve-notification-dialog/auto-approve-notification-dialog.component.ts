import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'auto-approve-notification-dialog',
  templateUrl: './auto-approve-notification-dialog.component.html',
  styleUrls: ['./auto-approve-notification-dialog.component.css']
})
export class AutoApproveNotificationDialogComponent implements OnInit {
  noAutoApprovalReasons: any;
  constructor(public dialogRef: MatDialogRef<AutoApproveNotificationDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any) { 
                  this.noAutoApprovalReasons = data.noAutoApprovalReasons;
                }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }
}
