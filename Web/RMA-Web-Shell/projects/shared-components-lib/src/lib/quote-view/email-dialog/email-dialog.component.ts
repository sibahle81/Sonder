import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LeadService } from 'projects/clientcare/src/app/lead-manager/services/lead.service';
import { Lead } from 'projects/clientcare/src/app/lead-manager/models/lead';
import { BehaviorSubject } from 'rxjs';
import { LeadContactV2 } from 'projects/clientcare/src/app/lead-manager/models/lead-contact-V2';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { QuoteV2 } from 'projects/clientcare/src/app/quote-manager/models/quoteV2';
import { QuoteViewV2Component } from '../quote-view.component';

@Component({
  selector: 'email-dialog',
  templateUrl: './email-dialog.component.html',
  styleUrls: ['./email-dialog.component.css']
})

export class EmailDialogComponent {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  quote: QuoteV2;
  lead: Lead;

  supportedPreferredCommunicationTypes = [CommunicationTypeEnum.Email];
  selectedLeadContactV2s: LeadContactV2[];

  constructor(
    public dialogRef: MatDialogRef<QuoteViewV2Component>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly leadService: LeadService
  ) {
    if (data.quote) {
      this.quote = data.quote;
      this.getLead();
    }
  }

  getLead() {
    this.leadService.getLead(this.quote.leadId).subscribe(result => {
      this.lead = result;
      this.isLoading$.next(false);
    });
  }

  contactSelected($event: LeadContactV2[]) {
    this.selectedLeadContactV2s = $event;
  }

  save() {
    this.dialogRef.close(this.selectedLeadContactV2s);
  }

  cancel() {
    this.selectedLeadContactV2s = null;
    this.dialogRef.close(null);
  }
}
