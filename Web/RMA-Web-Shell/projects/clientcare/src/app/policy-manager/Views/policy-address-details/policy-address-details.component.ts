import { Component, OnInit } from '@angular/core';
import { RolePlayerAddressDetailComponent } from 'projects/shared-components-lib/src/lib/role-player-address-detail/role-player-address-detail.component';
import { Case } from '../../shared/entities/case';
import { UntypedFormBuilder } from '@angular/forms';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { RolePlayerAddressDetailDataSource } from 'projects/shared-components-lib/src/lib/role-player-address-detail/role-player-address-detail.datasource';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardComponentInterface } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AddressService } from 'projects/shared-services-lib/src/lib/services/address/address.service';

@Component({
  selector: 'policy-address-details',
  templateUrl: '../../../../../../shared-components-lib/src/lib/role-player-address-detail/role-player-address-detail.component.html'
})
export class PolicyAddressDetailsComponent extends RolePlayerAddressDetailComponent implements WizardComponentInterface, OnInit {

  firstName: string;
  displayName: string;
  step: string;
  singleDataModel = true;
  case: Case;

  constructor(
    formBuilder: UntypedFormBuilder,
    lookupService: LookupService,
    dataSource: RolePlayerAddressDetailDataSource,
    dialog: MatDialog,
    addressService: AddressService,
    alertService: AlertService
  ) {
      super(formBuilder, lookupService, dataSource, dialog, addressService, alertService);
      this.isWizard = true;
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
      this.dataSource.isLoading = false;

      if (this.case !== null && this.case.mainMember != null && this.case.mainMember.rolePlayerAddresses != null &&
         this.case.mainMember.rolePlayerAddresses.length > 0) {
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
