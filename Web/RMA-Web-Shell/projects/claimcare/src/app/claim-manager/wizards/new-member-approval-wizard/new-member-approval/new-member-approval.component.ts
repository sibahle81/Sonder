import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, UntypedFormBuilder } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { MemberApproval } from '../../../shared/entities/funeral/member-approval';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { RolePlayerType } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-type';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';

@Component({
  selector: 'app-new-member-approval',
  templateUrl: './new-member-approval.component.html',
  styleUrls: ['./new-member-approval.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class NewMemberApprovalComponent extends WizardDetailBaseComponent<MemberApproval> implements OnInit {
  memberForm: UntypedFormGroup;
  numericNumberReg = '^-?[0-9]\\d*(\\.\\d{1,2})?$';
  stringReg = '[a-zA-Z ]*';
  isLoading = false;
  rolePlayerTypes: RolePlayerType[];
  rolePlayerType: RolePlayerType;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly policyService: PolicyService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
    this.onLoadLookups();
  }


  ngOnInit() {
    this.createForm(0);
    this.populateForm();
  }


  getRolePlayerTypes() {
    this.rolePlayerService.getRolePlayerTypeIsRelation().subscribe(
      data => {
        this.rolePlayerTypes = data;
      }
    );
  }

  onLoadLookups(): void {
    this.getRolePlayerTypes();
  }

  createForm(id: any) {
    this.memberForm = this.formBuilder.group({
      id: id as number,
      typeOfDeath: new UntypedFormControl('', [Validators.required]),
      dateOfDeath: new UntypedFormControl('', [Validators.required]),
      dateNotified: new UntypedFormControl('', [Validators.required]),
      firstName: new UntypedFormControl('', [Validators.required, Validators.pattern(this.stringReg)]),
      lastName: new UntypedFormControl('', [Validators.required, Validators.pattern(this.stringReg)]),
      dateOfBirth: new UntypedFormControl('', [Validators.required]),
      idNumber: new UntypedFormControl('', [Validators.required, Validators.pattern(this.numericNumberReg)]),
      typeOfRelation: new UntypedFormControl('', [Validators.required]),
    });
  }

  populateForm() {
    // const rolePlayerRelation = new RolePlayerRelation();
    this.isLoading = true;
    this.memberForm.patchValue({
      typeOfDeath: this.model.event.personEvents[0].personEventDeathDetail.deathTypeId,
      dateOfDeath: this.model.event.personEvents[0].personEventDeathDetail.deathDate,
      dateNotified: new Date(this.model.event.personEvents[0].dateCaptured),
      firstName: this.model.rolePlayer.person.firstName,
      lastName: this.model.rolePlayer.person.surname,
      dateOfBirth: this.model.rolePlayer.person.dateOfBirth,
      idNumber: this.model.rolePlayer.person.idNumber,
      typeOfRelation: this.model.rolePlayer.toRolePlayers[0].rolePlayerTypeId
    });
    this.isLoading = false;
    this.memberForm.disable();
  }

  populateModel() { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    // if (this.errors.length > 0) {
    //   validationResult.errors = this.errors.length;
    //   validationResult.errorMessages = this.errors;
    // }
    return validationResult;
  }

}
