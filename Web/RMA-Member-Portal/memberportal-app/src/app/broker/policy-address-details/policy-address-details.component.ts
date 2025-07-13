import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { WizardComponentInterface } from 'src/app/shared/components/wizard/sdk/wizard-component.interface';
import { ValidationResult } from 'src/app/shared/components/wizard/shared/models/validation-result';
import { WizardContext } from 'src/app/shared/components/wizard/shared/models/wizard-context';
import { Case } from 'src/app/shared/models/case';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { RolePlayerAddressDetailComponent } from '../role-player-address-detail/role-player-address-detail.component';


@Component({
  selector: 'policy-address-details',
  templateUrl: '../role-player-address-detail/role-player-address-detail.component.html'
})
export class PolicyAddressDetailsComponent extends RolePlayerAddressDetailComponent implements WizardComponentInterface, OnInit {

  firstName: string;
  displayName: string;
  step: string;
  singleDataModel = true;
  hasAddress = false;
  case: Case;

  constructor(
    formBuilder: FormBuilder,
    lookupService: LookupService,
    dialog: MatDialog
  ) {
    super(formBuilder, lookupService, dialog);
    this.isWizard = true;

  }

  ngOnInit() {
    this.hasAddress$.subscribe(result => {
      this.hasAddress = result;
    });
  }

  wizardReadFormData(context: WizardContext): Case {
    const caseModel = context.data[0] as Case;
    this.rolePlayerAddresses.forEach(rp => {
      if (!rp.countryId) {
        rp.countryId = 1;
      }
    });
    caseModel.mainMember.rolePlayerAddresses = this.rolePlayerAddresses;
    this.case = caseModel;
    return caseModel;
  }

  wizardPopulateForm(context: WizardContext): void {
    this.case = context.data[0] as Case;
    this.isLoading$.next(false);

    if (this.case !== null && this.case.mainMember != null && this.case.mainMember.rolePlayerAddresses != null &&
      this.case.mainMember.rolePlayerAddresses.length > 0) {
      this.hasAddress$.next(true);
      this.rolePlayerAddresses = this.case.mainMember.rolePlayerAddresses;
      this.getData();
    }
  }

  wizardValidateForm(context: WizardContext): ValidationResult {
    this.wizardPopulateForm(context);
    this.displayName = 'Addresses';
    const validationResult = new ValidationResult(this.displayName);
    const caseModel = context.data[0] as Case;

    if (!caseModel.mainMember.rolePlayerAddresses || caseModel.mainMember.rolePlayerAddresses.length === 0) {
      validationResult.errorMessages = ['At least a single address must be captured'];
      validationResult.errors = 1;
    }

    return validationResult;
  }
}
