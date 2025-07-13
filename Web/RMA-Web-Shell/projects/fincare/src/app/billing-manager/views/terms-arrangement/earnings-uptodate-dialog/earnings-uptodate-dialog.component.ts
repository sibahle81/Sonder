import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-earnings-uptodate-dialog',
  templateUrl: './earnings-uptodate-dialog.component.html',
  styleUrls: ['./earnings-uptodate-dialog.component.css']
})
export class EarningsUptodateDialogComponent implements OnInit {

  earningsUptodate$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  earningsNotUptodate$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(public dialogRef: MatDialogRef<EarningsUptodateDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    if (data.earningsUptodate === true) {
      this.earningsUptodate$.next(true);
      this.earningsNotUptodate$.next(false);
    } else {
      this.earningsUptodate$.next(false);
      this.earningsNotUptodate$.next(true);
    }
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }
}
