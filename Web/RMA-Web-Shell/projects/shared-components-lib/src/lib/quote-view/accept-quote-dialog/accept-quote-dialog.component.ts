
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QuoteStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/quote-status.enum';
import { QuoteV2 } from 'projects/clientcare/src/app/quote-manager/models/quoteV2';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  templateUrl: './accept-quote-dialog.component.html',
  styleUrls: ['./accept-quote-dialog.component.css']
})
export class AcceptQuoteDialogComponent {
  quote: QuoteV2;

  documentSystemName = DocumentSystemNameEnum.QuoteManager;
  documentSet = DocumentSetEnum.AcceptedQuoteDocuments;
  requiredDocumentsUploaded = false;

  accepted = QuoteStatusEnum.Accepted;

  constructor(
    public dialogRef: MatDialogRef<AcceptQuoteDialogComponent>,
    public alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.quote) {
      this.quote = data.quote;
    }
  }

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
  }

  submit() {
    this.dialogRef.close(this.requiredDocumentsUploaded);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
