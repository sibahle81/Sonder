import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';
import { ChildToAdultPensionLedger } from 'projects/penscare/src/app/shared-penscare/models/child-to-adult-pension-ledger.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { PensCareUtilities } from 'projects/penscare/src/app/shared-penscare/utils/penscare-utilities';
import { PersonTypeEnum } from 'projects/shared-models-lib/src/lib/enums/person-type-enum';
import { PenscareLookups } from 'projects/penscare/src/app/shared-penscare/models/penscare-lookups';
import { PensCareService } from 'projects/penscare/src/app/pensioncase-manager/services/penscare.service';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

@Component({
  selector: 'app-child-extension-beneficiary',
  templateUrl: './child-extension-beneficiary.component.html',
  styleUrls: ['./child-extension-beneficiary.component.css'],
  providers: [RolePlayerService]
})
export class ChildExtensionBeneficiaryComponent extends WizardDetailBaseComponent<ChildToAdultPensionLedger> implements OnInit {
  pensCareContext = PensionCaseContextEnum.Manage;
  isViewForm = false;
  beneficiary: Person;
  formHeader = `Beneficiary personal detail`;

  lookups: PenscareLookups;

  fetchingBeneficiaryDetails: boolean;
  isBeneficiaryLoaded: boolean;

  constructor(
    appEventsManager: AppEventsManager,
    private formBuilder: UntypedFormBuilder,
    private pensCareService: PensCareService,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {}

  createForm(): void {
    if (!this.isBeneficiaryLoaded) {
      return;
    }
    this.form = PensCareUtilities.createPersonFromPersonModel(this.formBuilder, this.beneficiary)
  }

  onLoadLookups(): void {
    this.lookups = PensCareUtilities.generateLookupsFromPersonModel(this.beneficiary);
  }

  populateModel(): void {}
  populateForm(): void {
    this.fetchingBeneficiaryDetails = true;
    this.pensCareService.getBeneficiaryDetails(this.model.beneficiaryRolePlayerId).subscribe(
      response => {
        this.fetchingBeneficiaryDetails = false;
        this.beneficiary = response[0];
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
