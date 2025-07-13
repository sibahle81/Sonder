import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-other-earning-type-modal',
  templateUrl: './other-earning-type-modal.component.html',
  styleUrls: ['./other-earning-type-modal.component.css'],
})
export class OtherEarningTypeModal implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<OtherEarningTypeModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.data = null;
    this.dialogRef.close();
  }

  ngOnInit() {}
}
