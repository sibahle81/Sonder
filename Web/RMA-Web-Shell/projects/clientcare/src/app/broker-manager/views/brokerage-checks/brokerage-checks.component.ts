import { Component } from '@angular/core';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Brokerage } from '../../models/brokerage';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidityChecksComponent } from 'projects/shared-components-lib/src/lib/validity-checks/validity-checks.component';
import { ValidityChecksDatasource } from 'projects/shared-components-lib/src/lib/validity-checks/validity-checks.datasource';
import { ValidityCheckType } from 'projects/shared-models-lib/src/lib/enums/validity-check-type.enum';

@Component({
  selector: 'brokerage-checks',
  templateUrl: '../../../../../../shared-components-lib/src/lib/validity-checks/validity-checks.component.html'
})
export class BrokerageChecksComponent extends ValidityChecksComponent<Brokerage> {
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
    this.validityCheckType = ValidityCheckType.Brokerage;
    this.validityChecksModel = this.model.brokerageChecks;
    super.populateForm();
  }

  populateModel(): void {
    this.populateValidityChecksModel();
    this.model.brokerageChecks = this.validityChecksModel;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (validationResult.valid) {
      let totalValidityChecks = 0;
      this.validityCheckSetCategories.forEach(x => {
        totalValidityChecks += x.validityCheckSets.length;
      });
      if (this.model.brokerageChecks === undefined || this.model.brokerageChecks.filter(x => x.isChecked).length !== totalValidityChecks) {
        validationResult.errorMessages = ['Please confirm all brokerage checks'];
        validationResult.errors = 1;
      }
    }
    return validationResult;
  }

  createForm(id: number): void {
  }

  onLoadLookups(): void {
  }
}

