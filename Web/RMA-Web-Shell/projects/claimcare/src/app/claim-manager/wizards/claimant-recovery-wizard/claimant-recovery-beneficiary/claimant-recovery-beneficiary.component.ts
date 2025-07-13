import { Component } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ClaimantRecoveryModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claimant-recovery-model';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BankBranch } from 'projects/shared-models-lib/src/lib/lookup/bank-branch';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

@Component({
  selector: 'claimant-recovery-beneficiary',
  templateUrl: './claimant-recovery-beneficiary.component.html',
  styleUrls: ['./claimant-recovery-beneficiary.component.css']
})
export class ClaimantRecoveryBeneficiaryComponent extends WizardDetailBaseComponent<ClaimantRecoveryModel> {

  hasPermission: boolean;
  person: RolePlayer = null;
  gender: string;
  branchId: number;
  bankingDetails: RolePlayerBankingDetail = null;
  identificationNumber: string;
  bankBranch: BankBranch[];
  requiredPermission = 'Create Claimant Recovery';

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    private readonly lookup: LookupService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
    this.onLoadLookups();
  }

  onLoadLookups(): void {
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
  }

  createForm(id: number): void {

  }

  populateModel(): void {
  }

  populateForm(): void {
    this.getBankBranch();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult;
  }

  getBankBranch() {
    this.lookup.getBankBranches().subscribe(result => {
      this.bankBranch = result;
      this.person = this.model.rolePlayer;
      this.identificationNumber = this.person.person.idNumber !== null ? this.person.person.idNumber : this.person.person.passportNumber;
      this.bankingDetails = this.model.rolePlayer.rolePlayerBankingDetails[0];
      result.forEach(bank => {
        if (bank.bankId == this.bankingDetails.bankBranchId) {
          this.model.rolePlayer.rolePlayerBankingDetails[0].bankName = bank.bank.name;
        }
      });
    });
  }

  back() {
  }
}
