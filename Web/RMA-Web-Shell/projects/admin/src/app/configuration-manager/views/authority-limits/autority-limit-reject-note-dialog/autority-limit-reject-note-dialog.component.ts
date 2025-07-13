import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'app-autority-limit-reject-note-dialog',
  templateUrl: './autority-limit-reject-note-dialog.component.html',
  styleUrls: ['./autority-limit-reject-note-dialog.component.css']
})
export class AutorityLimitRejectNoteDialogComponent {
  public noteText = '';
  isLoading: boolean;
  constructor(
    private readonly claimService: ClaimCareService,
    public dialogRef: MatDialogRef<AutorityLimitRejectNoteDialogComponent>,
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async RejectClaimInvoicePayment() {
    if(this.noteText)
    {
      this.isLoading = true;
      let currentUser = this.authService.getUserEmail().toLowerCase();
      const note = new Note();
      note.itemType = 'Claim';
      note.itemId = this.data.claimId;
      note.text = this.noteText;
      note.reason = 'Claim Invoice Payment Rejected';
      note.createdBy = currentUser;
      note.modifiedBy = currentUser;
      await this.claimService.rejectClaimInvoicePayment(note).subscribe((result: number) => {
        if(result <= 0)
        {
          this.alertService.error('Failed to reject claim payment.', 'Reject Claim Invoice Payment');
        }
        else
        {
          this.alertService.success('Claim Payment Rejected Sucessfully','Reject Claim Invoice Payment');
        }
        this.isLoading = false;        
        this.dialogRef.close(null); 
       });
    }
  }

}
