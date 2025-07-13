import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Note } from '../../../notes/note';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'lib-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.css'],
})
export class ConfirmDeleteComponent {
  public noteText = '';
  isLoading: boolean;
  constructor(
    private readonly claimService: ClaimCareService,
    public dialogRef: MatDialogRef<ConfirmDeleteComponent>,
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async deleteClaim() {
    if(this.noteText)
    {
      this.isLoading = true;
      let currentUser = this.authService.getUserEmail().toLowerCase();
      const note = new Note();
      note.itemType = 'Claim';
      note.itemId = this.data.claimId;
      note.text = this.noteText;
      note.reason = 'Claim Deleted';
      note.createdBy = currentUser;
      note.modifiedBy = currentUser;
      await this.claimService.deleteClaim(note).subscribe((result: number) => {
        if(result == -1)
        {
          this.alertService.error('Failed to delete claim.', 'Delete Claim');
        }
        else
        {
          this.alertService.success('Claim Deleted Sucessfully','Delete Claim');
        }
        this.isLoading = false;        
        this.dialogRef.close(null); 
       });
    }
  }
}
