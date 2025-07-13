import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { SwitchBatchType } from '../../../shared/enums/switch-batch-type';

@Component({
  selector: 'app-preauth-view-modal',
  templateUrl: './preauth-view-modal.component.html',
  styleUrls: ['./preauth-view-modal.component.css']
})
export class PreauthViewModalComponent implements OnInit {

  loading$ = new BehaviorSubject<boolean>(true);
  preauthViewId: number;
  switchBatchType: SwitchBatchType = SwitchBatchType.MedEDI;//default val used if not set/passed
  constructor(public dialogRef: MatDialogRef<PreauthViewModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.preauthViewId = data.id;
    this.switchBatchType = data.switchBatchType;
  }

  ngOnInit() {

  }
  
  preAuthViewBreakdownsTotalResponseCheck(count){
    if(Number(count) > 0){
      this.loading$.next(false);
    }
    else{
      this.loading$.next(true);
    }
  }
}

