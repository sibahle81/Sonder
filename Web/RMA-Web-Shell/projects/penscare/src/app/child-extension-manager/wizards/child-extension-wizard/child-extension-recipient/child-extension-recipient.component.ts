import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';
import { ChildToAdultPensionLedger } from 'projects/penscare/src/app/shared-penscare/models/child-to-adult-pension-ledger.model';
import { PenscareLookups } from 'projects/penscare/src/app/shared-penscare/models/penscare-lookups';
import { PensCareUtilities } from 'projects/penscare/src/app/shared-penscare/utils/penscare-utilities';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { PersonTypeEnum } from 'projects/shared-models-lib/src/lib/enums/person-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'app-child-extension-recipient',
  templateUrl: './child-extension-recipient.component.html',
  styleUrls: ['./child-extension-recipient.component.css'],
  providers: [RolePlayerService]
})
export class ChildExtensionRecipientComponent extends WizardDetailBaseComponent<ChildToAdultPensionLedger> implements OnInit {
  pensCareContext = PensionCaseContextEnum.Manage;
  isViewForm = false;
  beneficiary: RolePlayer;
  formHeader = `Recipient personal detail`;

  lookups: PenscareLookups;

  fetchingBeneficiaryDetails: boolean;
  isBeneficiaryLoaded: boolean;

  constructor(
    appEventsManager: AppEventsManager,
    private formBuilder: UntypedFormBuilder,
    private rolePlayerService: RolePlayerService,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {}

  createForm(): void {
    if (!this.isBeneficiaryLoaded) {
      return;
    }
    this.form = PensCareUtilities.createPersonDetailsForm(this.formBuilder, this.beneficiary, PersonTypeEnum.Recipient)
  }

  onLoadLookups(): void {
    this.lookups = PensCareUtilities.generateLookups(this.beneficiary);
  }

  populateModel(): void {}
  populateForm(): void {
    this.fetchingBeneficiaryDetails = true;
    this.rolePlayerService.getRolePlayer(this.model.recipientRolePlayerId).subscribe(
      response => {
        this.fetchingBeneficiaryDetails = false;
        this.beneficiary = response;
        this.isBeneficiaryLoaded = true;
        this.onLoadLookups();
        this.createForm();
      }
    );
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
