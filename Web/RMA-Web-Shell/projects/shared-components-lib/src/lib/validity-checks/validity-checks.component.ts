import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidityCheckSet } from 'projects/shared-models-lib/src/lib/common/validity-checkset';
import { WizardDetailBaseComponent } from '../wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ValidityCheckType } from 'projects/shared-models-lib/src/lib/enums/validity-check-type.enum';
import { ValidityChecksDatasource } from './validity-checks.datasource';
import { ValidityChecksetRequest } from 'projects/shared-models-lib/src/lib/common/validity-checkset-request';
import { ValidityCheck } from 'projects/shared-models-lib/src/lib/common/validity-check';
import { ValidationResult } from '../wizard/shared/models/validation-result';
import { ValidityCheckCategory } from 'projects/shared-models-lib/src/lib/common/validity-check-category';
import { WizardStatus } from '../wizard/shared/models/wizard-status.enum';

@Component({
  selector: 'lib-validity-checks',
  templateUrl: './validity-checks.component.html',
  styleUrls: ['./validity-checks.component.css']
})
export class ValidityChecksComponent<TModel> extends WizardDetailBaseComponent<TModel> implements OnInit {

  validityChecksModel: ValidityCheck[];
  validityCheckSetCategories: ValidityCheckCategory[] = [];
  validityCheckType: ValidityCheckType;
  itemId: number;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    public readonly dataSource: ValidityChecksDatasource
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  getValidityCheckTypeDesc(): string {
    switch (this.validityCheckType) {
      case ValidityCheckType.Brokerage:
        return 'Brokerage';
        case ValidityCheckType.JuristicRep:
          return 'Juristic Rep';
          case ValidityCheckType.NaturalRep:
            return 'Natural Rep';
          default:
            return '';
    }
  }

  populateValidityChecksModel(): void {
    this.validityChecksModel = [];
    this.validityCheckSetCategories = this.dataSource.data;
    this.validityCheckSetCategories.forEach(c => {
    c.validityCheckSets.forEach(x => {
    const validityCheck: ValidityCheck = new ValidityCheck();
    validityCheck.itemId = this.itemId;
    validityCheck.validityChecksetId = x.id;
    validityCheck.isChecked = x.isChecked;
    this.validityChecksModel.push(validityCheck);
    });
  });
  }

  displayValidityChecks(): void {
    let modelChecksetIds: number[] = [];
    let selectedChecksetIds: number[] = [];
    if (this.validityChecksModel) {
        selectedChecksetIds = this.validityChecksModel.filter(x => x.isChecked).map(({ validityChecksetId }) => validityChecksetId);
        modelChecksetIds = this.validityChecksModel.map(({ validityChecksetId }) => validityChecksetId);
      } else {
        selectedChecksetIds = [];
        modelChecksetIds = [];
      }

    const validityChecksetRequest = new ValidityChecksetRequest();
    validityChecksetRequest.checkType = this.validityCheckType;
    validityChecksetRequest.modelChecksetIds = modelChecksetIds;
    validityChecksetRequest.selectedChecksetIds = selectedChecksetIds;
    if (this.context && this.context.wizard) {
      validityChecksetRequest.isReadonly = !(this.inApprovalMode);
    }
    this.dataSource.getData(validityChecksetRequest);
  }

  createForm(id: number): void {
    throw new Error('Implement createForm method in child component.');
  }

  onLoadLookups(): void {
    throw new Error('Implement onLoadLookups method in child component.');
  }

  populateModel(): void {
    throw new Error('Implement populateModel() method in child component.');
  }

  populateForm(): void {
    this.displayValidityChecks();
  }

  onValidateModel(validationResult: ValidationResult) {
    return validationResult;
  }

  onSelectAll(checked: boolean, categoryId: number) {
    let validityCheckCategories: ValidityCheckCategory[] = [];
    validityCheckCategories = this.dataSource.data;
    const category = validityCheckCategories.filter(x => x.id === categoryId)[0];
    category.validityCheckSets.forEach(validityCheck => {
            validityCheck.isChecked = checked;
        });
    this.dataSource.dataChange.next(validityCheckCategories);
  }
}
