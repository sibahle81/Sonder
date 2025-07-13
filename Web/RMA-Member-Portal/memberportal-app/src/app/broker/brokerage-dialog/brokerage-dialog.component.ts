import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-brokerage-dialog',
  templateUrl: './brokerage-dialog.component.html',
  styleUrls: ['./brokerage-dialog.component.css']
})
export class BrokerageDialogComponent implements OnInit {

  constructor( formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<BrokerageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data) { 
        dialogRef.disableClose = true;
    }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close('No');
  }

  onYesClick(): void {
    this.dialogRef.close('Yes');
  }
  
}
