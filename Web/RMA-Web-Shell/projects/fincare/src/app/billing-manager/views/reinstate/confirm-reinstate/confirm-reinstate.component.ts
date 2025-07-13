import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReinstateType } from 'projects/shared-models-lib/src/lib/enums/reinstate-type.enum';

@Component({
  selector: 'app-confirm-reinstate',
  templateUrl: './confirm-reinstate.component.html',
  styleUrls: ['./confirm-reinstate.component.css']
})
export class ConfirmReinstateComponent implements OnInit {
  labelType = '';
  writeOffType: ReinstateType;
  showSubmit = true;
  constructor(public dialogRef: MatDialogRef<ConfirmReinstateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.writeOffType === ReinstateType.Interest) {
      this.labelType = 'Interest'
    }
    else if (this.writeOffType === ReinstateType.Premium) {
      this.labelType = 'Premium'
    }
    else if (this.writeOffType === ReinstateType.InterestPlusPremium) {
      this.labelType = 'Interest + Premium'
    }
  }

  ngOnInit(): void {
  }

  yesReinstate() {
    this.dialogRef.close({ confirmation: true });
  }

  close() {
    this.dialogRef.close({ confirmation: false });
  }
}