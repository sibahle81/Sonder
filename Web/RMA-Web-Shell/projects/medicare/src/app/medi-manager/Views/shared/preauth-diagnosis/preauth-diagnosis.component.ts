import { Component, Input } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PreAuthIcd10Code } from 'projects/medicare/src/app/medi-manager/models/preAuthIcd10Code';
import { PreauthIcd10SearchDialogComponent } from 'projects/medicare/src/app/medi-manager/views/shared/icd10-search-dialog/preauth-icd10-search-dialog.component';
import { PreAuthTreatmentBasket } from 'projects/medicare/src/app/preauth-manager/models/preauth-treatment-basket';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { ICD10CodeModel } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-model';
import { ICD10CodeService } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { isNullOrUndefined } from 'util';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { PreauthTypeEnum } from '../../../enums/preauth-type-enum';

@Component({
  selector: 'preauth-diagnosis',
  templateUrl: './preauth-diagnosis.component.html',
  styleUrls: ['./preauth-diagnosis.component.css']
})
export class PreAuthDiagnosisComponent extends WizardDetailBaseComponent<PreAuthorisation> {
  @Input() preAuthDiagnosisType: string;
  @Input() showTreamentBaskets: boolean = true;
  bodySides = [];
  injuryTypes = [];
  icd10Codes: ICD10CodeModel[];
  treatmentBaskets: PreAuthTreatmentBasket[];
  addedTreatmentBaskets: PreAuthTreatmentBasket[];
  selectedTreatmentBasket: PreAuthTreatmentBasket;
  isICD10CodeExists = false;
  isInternalUser: boolean = false;
  isHospitalAuth: boolean = false;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly appEventsManager: AppEventsManager,
    private readonly icd10CodeService: ICD10CodeService,
    private readonly lookupService: LookupService,
    private readonly preAuthService: MediCarePreAuthService,
    private readonly healthcareProviderService: HealthcareProviderService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly userService: UserService) {
    super(appEventsManager, authService, activatedRoute);
  }

  /* #region initialisation  */

  ngOnInit() {
    this.initBodySides();
    this.initInjuryTypes();
    this.icd10Codes = [];
    this.addedTreatmentBaskets = [];
    this.createForm();
    this.checkTreamentBaskets();
  }

  initBodySides(): void {
    this.lookupService.getBodySides().subscribe(response => {
      if (!response) throw Error(`Failed to initialize lookups. The 'BodySides' lookup returned no results.`);
      response.forEach(x => { this.bodySides.push({ displayValue: x.name, id: x.id }) });
    });
  }

  initInjuryTypes(): void {
    this.injuryTypes = [{ displayValue: 'Primary', id: 1 }, { displayValue: 'Secondary', id: 2 }];
  }

  /* #endregion initialisation */

  /* #region wizard methods */

  createForm(): void {
    if (this.form) { return; }

    this.form = this.formBuilder.group({

    });
  }

  onLoadLookups(): void {
  }

  populateModel(): void {
    if (this.model === undefined || this.model === null) return;
    this.checkTreamentBaskets();
    // Map ICD10CodeModel[] the model's PreAuthICD10Code[] for saving

    let authICD10Codes: PreAuthIcd10Code[]; authICD10Codes = [];

    for (const x of this.icd10Codes) {

      let userId = this.authService.getCurrentUser().id;
      let requesterType = userId & 0xFF;
      let injuryTypeId = parseInt(x["injuryTypeId"]) & 0xFF;
      let bodySideId = parseInt(x["bodySideId"]);

      let item = new PreAuthIcd10Code();
      item.icd10Code = x.icd10Code;
      item.icd10CodeId = x.icd10CodeId;
      item.injuryType = injuryTypeId;
      item.bodySideId = bodySideId;
      item.isMatching = false;
      item.isAuthorised = false;
      item.isClinicalUpdate = false;
      item.requesterType = requesterType;
      authICD10Codes.push(item);
    }
    // Assign ICD10-codes to model
    if (!isNullOrUndefined(authICD10Codes) && !isNullOrUndefined(this.addedTreatmentBaskets)) {
      this.model.preAuthIcd10Codes = authICD10Codes.filter((v, i) => authICD10Codes.findIndex(item => item.icd10CodeId == v.icd10CodeId && item.icd10Code == v.icd10Code && item.injuryType == v.injuryType && item.bodySideId == v.bodySideId) === i);
      this.model.preAuthTreatmentBaskets = this.addedTreatmentBaskets.filter((v, i) => this.addedTreatmentBaskets.findIndex(item => item.icd10CodeId == v.icd10CodeId && item.treatmentBasketId == v.treatmentBasketId) === i);
    }
  }
  populateForm(): void {
    if (!this.model) return
    // If the model is not initialised or 'this.icd10Codes' is initialised then there is nothing to do.

    if (this.icd10Codes && this.icd10Codes.length > 0) return;

    if (!this.model.preAuthIcd10Codes) return;

    this.addedTreatmentBaskets = []; let icd10Codes = this.model.preAuthIcd10Codes.map(x => { return x.icd10Code });
    if (this.model.preAuthIcd10Codes === undefined) return;
    // Map the model's PreAuthICD10Code[] to ICD10CodeModel[] for display
    this.checkTreamentBaskets();
    for (let i = 0; i < icd10Codes.length; i++) {

      let x = icd10Codes[i];

      this.icd10CodeService.filterICD10Code(x).subscribe(result => {
        if (!result) return;

        // Manually initialise additional dynamic properties
        result[0]["bodySideId"] = this.model.preAuthIcd10Codes[i].bodySideId;
        result[0]["injuryTypeId"] = this.model.preAuthIcd10Codes[i].injuryType;

         // check for duplicate icd10code
         let existingICD10Code = this.findIndex(this.icd10Codes, icd => { return icd["icd10CodeId"] == result[0].icd10CodeId && icd["bodySideId"] ==  result[0]["bodySideId"] });
         if (existingICD10Code >= 0) return;
         this.icd10Codes.push(result[0]);

        this.preAuthService.getTreatmentBasketForICD10CodeId(result[0].icd10CodeId).subscribe(response => {
          if (!response) return;

          // Don't display the same treatment-basket
          let existing = this.findIndex(this.icd10Codes, ic => { return ic["treatmentBasketId"] == response.treatmentBasketId.toString() });
          if (existing >= 0) return;

          this.addedTreatmentBaskets.push(response);
          result[0]["treatmentBasketId"] = response.treatmentBasketId;
        });

      });
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    var practitionerType = this.healthcareProviderService.preAuthPractitionerTypeSetting;
    var currentUser = this.authService.getCurrentUser();
    if (currentUser.isInternalUser || practitionerType?.isHospital) {
      if (this.icd10Codes != null) {
        if (this.icd10Codes.length <= 0) {
          validationResult.errors = validationResult.errors + 1;
          validationResult.errorMessages.push(`Please capture at least one ICD10 code.`);
        }
      }
      else {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`Please capture at least one ICD10 code.`);
      }
    }
    return validationResult;
  }

  /* #endregion wizard methods */

  /* #region event handlers */

  onChangedTreatmentBasket(evt: MatSelectChange): void {
    this.selectedTreatmentBasket = this.findItem(this.treatmentBaskets, x => { return x.treatmentBasketId === parseInt(evt.value) });
  }

  onClickRemoveTreatmentBasket(item: PreAuthTreatmentBasket): void {
    let index = this.findIndex(this.addedTreatmentBaskets, x => { return x === item });
    this.addedTreatmentBaskets.splice(index, 1);
  }

  onClickAddICD10Code(): void {

    let items: ICD10CodeModel[]; items = [];

    // Display the 'icd10-code-filter' dialog

    let dialogRef = this.dialog.open(PreauthIcd10SearchDialogComponent, {
      height: '60%',
      width: '80%',
      panelClass: 'custom-dialog',
      data: { resultItems: items, bodySides: this.bodySides, injuryTypes: this.injuryTypes },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      // Store and display the filtered ICD10Codes and get the related treatment-baskets.
      for (const x of result.resultItems) {
        this.isICD10CodeExists = this.icd10Codes.some(t => t.icd10CodeId === x.icd10CodeId && t["bodySideId"] === x.bodySideId);
        if (!this.isICD10CodeExists) {
          this.icd10Codes.push(x);
        }
        else {
          this.confirmservice.confirmWithoutContainer('Duplicate ICD10Code Validation', `Same ICD10Code with same body side already added`,
          'Center', 'Center', 'OK').subscribe(result => {
  
          });
          
        }

        this.preAuthService.getTreatmentBasketForICD10CodeId(x.icd10CodeId).subscribe(response => {
          if (!response) return;
          let existing = this.findIndex(this.icd10Codes, ic => { return ic["treatmentBasketId"] == response.treatmentBasketId.toString() });
          if (existing >= 0) return;
          // Store and display the treatment-basket and link the ICD10Code to the basket
          if (this.preAuthDiagnosisType === undefined && this.showTreamentBaskets) {
            this.addedTreatmentBaskets.push(response);
          }

          x["treatmentBasketId"] = response.treatmentBasketId;
        });
      }

      items = this.icd10Codes;
      this.populateModel();
    });
  }

  onClickRemoveICD10Code(item: ICD10CodeModel): void {
    this.icd10Codes.splice(this.icd10Codes.indexOf(item), 1);
    this.addedTreatmentBaskets.splice(this.icd10Codes.indexOf(item), 1);
    this.populateModel();
  }

  getICD10CodeList(): PreAuthIcd10Code[] {
    let authICD10Codes: PreAuthIcd10Code[]; authICD10Codes = [];
    for (const x of this.icd10Codes) {

      let userId = this.authService.getCurrentUser().id;
      let requesterType = userId & 0xFF;
      let injuryTypeId = parseInt(x["injuryTypeId"]) & 0xFF;
      let bodySideId = parseInt(x["bodySideId"]);

      let item = new PreAuthIcd10Code();
      item.icd10Code = x.icd10Code;
      item.icd10CodeId = x.icd10CodeId;
      item.injuryType = injuryTypeId;
      item.bodySideId = bodySideId;
      item.isMatching = false;
      item.isAuthorised = false;
      item.isClinicalUpdate = false;
      item.requesterType = requesterType;
      authICD10Codes.push(item);
    }
    return authICD10Codes;
  }

  getTreatmentBasketList(): PreAuthTreatmentBasket[] {
    return this.addedTreatmentBaskets;
  }

  /* #endregion event handlers */

  /* #region helper methods */

  fetchTreatmentBaskets(): Promise<PreAuthTreatmentBasket[]> {
    return this.preAuthService.getTreatmentBaskets().toPromise();
  }

  fetchICD10Code(icd10Code: string): Promise<ICD10CodeModel[]> {
    return this.icd10CodeService.filterICD10Code(icd10Code).toPromise();
  }

  findItem<T>(itemList: T[], isMatchCallback: (item: T) => boolean) {
    return itemList.find(x => { return isMatchCallback(x); });
  }

  findIndex<T>(itemList: T[], isMatchCallback: (item: T) => boolean) {
    return itemList.findIndex(x => { return isMatchCallback(x); });
  }

  getBodySideDescription(bodySideId): string {
    if (!!bodySideId) {
      let bodySide = this.bodySides.find(bs => { return bodySideId == bs.id; });
      if (bodySide) return bodySide.displayValue;
    }
    return '';
  }

  getInjuryTypeDescription(injuryTypeId): string {
    if (!!injuryTypeId) {
      if (injuryTypeId === 1) {
        return "Primary";
      }
      else {
        return "Secondary";
      }
    }
    return '';
  }

  loadExistingICD10CodesAndTreatmentBaskets(preauthorisation) {
    this.model = preauthorisation;
    this.populateForm();
  }
  
  loadClinicalUpdateExistingICD10CodesAndTreatmentBaskets(icd10codes: PreAuthIcd10Code[], treatmentBasket: PreAuthTreatmentBasket[]) {
    this.model = new PreAuthorisation;
    this.model.preAuthIcd10Codes = icd10codes;
    this.model.preAuthTreatmentBaskets = treatmentBasket;
    this.populateForm();
  }

  checkTreamentBaskets(){
    var currentUser = this.authService.getCurrentUser();
    this.isHospitalAuth = this.model?.preAuthType == PreauthTypeEnum.Hospitalization;
    if (currentUser.isInternalUser && this.isHospitalAuth)
      this.showTreamentBaskets = true;
    else
      this.showTreamentBaskets = false;
  }

  /* #endregion helper methods */
}
