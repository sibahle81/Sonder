import { Component } from '@angular/core';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidityChecksComponent } from 'projects/shared-components-lib/src/lib/validity-checks/validity-checks.component';
import { ValidityChecksDatasource } from 'projects/shared-components-lib/src/lib/validity-checks/validity-checks.datasource';
import { ValidityCheckType } from 'projects/shared-models-lib/src/lib/enums/validity-check-type.enum';
import { Representative } from '../../models/representative';
import { RepresentativeTypeEnum } from 'projects/shared-models-lib/src/lib/enums/representative-type-enum';

@Component({
  selector: 'representative-checks',
  templateUrl: '../../../../../../shared-components-lib/src/lib/validity-checks/validity-checks.component.html'
})
export class RepresentativeChecksComponent extends ValidityChecksComponent<Representative> {
  displayName: string;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    dataSource: ValidityChecksDatasource
  ) {
    super(appEventsManager, authService, activatedRoute, dataSource);
  }

  populateForm(): void {
    this.itemId = this.model.id;
    this.validityCheckType = this.model.repType === RepresentativeTypeEnum.Juristic ? ValidityCheckType.JuristicRep : ValidityCheckType.NaturalRep;
    this.validityChecksModel = this.model.representativeChecks;
    super.populateForm();
  }

  populateModel(): void {
    this.populateValidityChecksModel();
    this.model.representativeChecks = this.validityChecksModel;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (validationResult.valid) {
      let totalValidityChecks = 0;
      this.populateValidityChecksModel();
      this.validityCheckSetCategories.forEach(x => {
        totalValidityChecks += x.validityCheckSets.length;
      });
      if (this.model.representativeChecks === undefined || this.model.representativeChecks.filter(x => x.isChecked).length !== totalValidityChecks) {
        validationResult.errorMessages = ['Please confirm all representative checks'];
        validationResult.errors = 1;
      }
      // When they jump directly to complete tab (bug 11276 )
      if (totalValidityChecks === 0) {
        validationResult.errorMessages = ['Please confirm all representative checks'];
        validationResult.errors = 1;
      }

      if (this.model.representativeBankAccounts.length > 0) {
        validationResult.errorMessages = [''];
        validationResult.errors = 0;
      }
    }
    return validationResult;
  }

  createForm(id: number): void {
  }

  onLoadLookups(): void {
  }
}

