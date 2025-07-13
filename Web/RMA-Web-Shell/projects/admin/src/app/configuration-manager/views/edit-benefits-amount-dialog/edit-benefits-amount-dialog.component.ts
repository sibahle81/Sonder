import { Component, OnInit,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import {ClaimsBenefitsAmount} from '../../shared/claims-benefits-amount';

@Component({
  selector: 'edit-benefits-amount-dialog',
  templateUrl: './edit-benefits-amount-dialog.component.html',
  styleUrls: ['./edit-benefits-amount-dialog.component.css'],
})
export class EditBenefitsAmountDialogComponent implements OnInit {
  editedClaimsBenefitsAmount:ClaimsBenefitsAmount
  claimBenefitsAmountEdited:boolean;

  constructor(private readonly claimCareService: ClaimCareService,
              public dialogRef: MatDialogRef<EditBenefitsAmountDialogComponent>,
              private readonly alertService: AlertService,
              private readonly authService: AuthService,
              @Inject(MAT_DIALOG_DATA) public data: {claimsBenefitsAmountToEdit:ClaimsBenefitsAmount}
  ) {}

  ngOnInit(): void {
    
    this.editedClaimsBenefitsAmount = new ClaimsBenefitsAmount();
    this.editedClaimsBenefitsAmount.claimBenefitAmountId = this.data.claimsBenefitsAmountToEdit.claimBenefitAmountId;
    this.editedClaimsBenefitsAmount.formula = this.data.claimsBenefitsAmountToEdit.formula;
    this.editedClaimsBenefitsAmount.description = this.data.claimsBenefitsAmountToEdit.description;
    this.editedClaimsBenefitsAmount.maximumCompensationAmount = this.data.claimsBenefitsAmountToEdit.maximumCompensationAmount;
    this.editedClaimsBenefitsAmount.minimumCompensationAmount = this.data.claimsBenefitsAmountToEdit.minimumCompensationAmount;
    
    let currentUser = this.authService.getUserEmail().toLowerCase();
    this.editedClaimsBenefitsAmount.modifiedBy = currentUser;

    this.editedClaimsBenefitsAmount.modifiedDate = new Date();

    this.claimBenefitsAmountEdited = false;
  }

  updateClaimBenefitsAmounts():void
  {
    this.alertService.loading('Updating claim benefits amounts...');

    this.claimCareService.updateClaimsBenefitsAmounts(this.editedClaimsBenefitsAmount).subscribe( response =>
      {
          if (response)
          {
            this.alertService.success("Claim Benefit Amounts updated successfully");
            this.claimBenefitsAmountEdited = true;
          }
          else
          {
            this.alertService.error("Failed to update Claim Benefit Amounts");
            this.claimBenefitsAmountEdited = false;
          }

          this.dialogRef.close();
          
      });
  }
  
  close():void
  {
    this.claimBenefitsAmountEdited = false;
    this.dialogRef.close();
  }
}
