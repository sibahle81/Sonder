import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrokerageDialogMessage } from '../../models/brokerage-dialog-message';

@Component({
  selector: 'app-brokerage-dialog',
  templateUrl: './brokerage-dialog.component.html',
  styleUrls: ['./brokerage-dialog.component.css']
})
export class BrokerageDialogComponent implements OnInit {

  constructor( public dialogRef: MatDialogRef<BrokerageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

}
