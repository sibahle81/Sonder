import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './quote-view-dialog.component.html',
  styleUrls: ['./quote-view-dialog.component.css']
})

export class QuoteViewDialogComponent {

  quoteId: number;

  constructor(
    public dialogRef: MatDialogRef<QuoteViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { 
    if(data && data.quoteId && data.quoteId > 0) {
      this.quoteId = +data.quoteId;
    }
  }

  close() {
    this.dialogRef.close(null);
  }
}
