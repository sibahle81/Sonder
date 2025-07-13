
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QuoteDocumentsComponent } from 'src/app/quote-documents/quote-documents.component';
import { QuoteStatusEnum } from 'src/app/shared/enums/quote-status.enum';
import { Quote } from 'src/app/shared/models/quote';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-accept-quote-dialog',
  templateUrl: './accept-quote-dialog.component.html',
  styleUrls: ['./accept-quote-dialog.component.css']
})
export class AcceptQuoteDialogComponent implements OnInit {
  @ViewChild(QuoteDocumentsComponent) quoteDocuments: QuoteDocumentsComponent;

  quote: Quote = new Quote();
  acceptedEnum = QuoteStatusEnum.Accepted as number;

  constructor(
    public dialogRef: MatDialogRef<AcceptQuoteDialogComponent>,
    public alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.quote) {
      this.quote = data.quote;
    }
  }

  ngOnInit() {
    console.log(this.quote);
  }

  submit() {
    const allDocumentsUploaded = this.quoteDocuments.checkAllDocumentsUpload();
    if (allDocumentsUploaded) {
      this.dialogRef.close(true);
    } else {
      this.alertService.loading('Please Upload a document before submitting', 'Missing Documents');
    }
  }

  cancel() {
    this.dialogRef.close();
  }

}
