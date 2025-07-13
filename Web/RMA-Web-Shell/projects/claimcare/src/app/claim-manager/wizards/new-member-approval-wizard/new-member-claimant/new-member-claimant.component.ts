import { RolePlayer } from '../../../../../../../clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { Component} from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, UntypedFormBuilder } from '@angular/forms';
import { RolePlayerType } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-type';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { MemberApproval } from '../../../shared/entities/funeral/member-approval';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

@Component({
  selector: 'app-new-member-claimant',
  templateUrl: './new-member-claimant.component.html',
  styleUrls: ['./new-member-claimant.component.css']
})
export class NewMemberClaimantComponent extends WizardDetailBaseComponent<MemberApproval> {
  claimantForm: UntypedFormGroup;
  numericNumberReg = '^-?[0-9]\\d*(\\.\\d{1,2})?$';
  stringReg = '[a-zA-Z ]*';
  isLoading = false;
  rolePlayerTypes: RolePlayerType[];
  claimant: RolePlayer;
  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly policyService: PolicyService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.getRolePlayerTypes();
    this.createForm('');
    this.claimant = new RolePlayer();
  }

  getRolePlayerTypes() {
    this.rolePlayerService.getRolePlayerTypeIsRelation().subscribe(
      data => {
        this.rolePlayerTypes = data;
      }
    );
  }

  onLoadLookups() { }

  createForm(id: any) {
    this.claimantForm = this.formBuilder.group({
      id: id as number,
      claimantFirstName: new UntypedFormControl('', [Validators.required]),
      claimantLastName: new UntypedFormControl('', [Validators.required]),
      claimantIdNumber: new UntypedFormControl('', [Validators.required]),
      claimantDateOfBirth: new UntypedFormControl('', [Validators.required]),
      claimantCellnumber: new UntypedFormControl('', [Validators.required]),
      claimantEmailAddress: new UntypedFormControl('', [Validators.required]),
      communicationType: new UntypedFormControl('', [Validators.required]),
    });
  }

  populateForm() {
    this.isLoading = true;
    console.log(this.model);
    this.rolePlayerService.getRolePlayer(this.model.event.memberSiteId).subscribe(rolePlayer => {
      this.claimant = rolePlayer;
      console.log(this.claimant);
      this.claimantForm.patchValue({
        claimantFirstName: this.claimant.person.firstName,
        claimantLastName: this.claimant.person.surname,
        claimantDateOfBirth: this.claimant.person.dateOfBirth,
        claimantIdNumber: this.claimant.person.idNumber,
        communicationType: this.claimant.preferredCommunicationTypeId

      });
      this.isLoading = false;
      this.claimantForm.disable();
    });
  }

  populateModel() { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}


