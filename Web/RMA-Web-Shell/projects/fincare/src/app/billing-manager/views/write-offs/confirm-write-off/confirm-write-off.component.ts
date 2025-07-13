import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WriteOffType } from 'projects/shared-models-lib/src/lib/enums/writeoff-type-enum';

@Component({
  selector: 'app-confirm-write-off',
  templateUrl: './confirm-write-off.component.html',
  styleUrls: ['./confirm-write-off.component.css']
})
export class ConfirmWriteOffComponent implements OnInit {
  labelType = '';
  writeOffType: WriteOffType;
  showSubmit = true;
  constructor(public dialogRef: MatDialogRef<ConfirmWriteOffComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.writeOffType === WriteOffType.Interest) {
      this.labelType = 'Interest'
    }
    else if (this.writeOffType === WriteOffType.Premium) {
      this.labelType = 'Premium'
    }
    else if (this.writeOffType === WriteOffType.InterestPlusPremium) {
      this.labelType = 'Interest + Premium'
    }
  }

  ngOnInit(): void {
  }

  yesWriteOff() {
    this.dialogRef.close({ confirmation: true });
  }

  close() {
    this.dialogRef.close({ confirmation: false });
  }
}