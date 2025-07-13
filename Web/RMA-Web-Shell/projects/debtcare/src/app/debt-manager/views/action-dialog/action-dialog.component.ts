import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DebtcareApiService } from '../../services/debtcare-api.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';

@Component({
  selector: 'app-action-dialog',
  templateUrl: './action-dialog.component.html',
  styleUrls: ['./action-dialog.component.css']
})
export class ActionDialogComponent implements OnInit {

  isSpinner: boolean = false;
  details: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogActionRef: MatDialogRef<ActionDialogComponent>,
  ) { }

  ngOnInit(): void {
    this.details = this.data.data;
  }

  deleteDoc(): void {
      this.dialogActionRef.close({ key: DataResponseEnum.Success });
  }

  closeDialog(status: string): void {
    this.dialogActionRef.close({ key: status });
  }

}
