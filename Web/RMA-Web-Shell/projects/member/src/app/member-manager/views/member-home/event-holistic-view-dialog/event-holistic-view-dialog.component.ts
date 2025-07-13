import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './event-holistic-view-dialog.component.html',
  styleUrls: ['./event-holistic-view-dialog.component.css']
})

export class EventHolisticViewDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<EventHolisticViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  close() {
    this.dialogRef.close(null);
  }
}
