import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ICD10CodeModel } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-model';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service'
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { Router } from '@angular/router';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { UntypedFormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PreAuthIcd10Code } from 'projects/medicare/src/app/medi-manager/models/preAuthIcd10Code';
import { PreAuthTreatmentBasket } from 'projects/medicare/src/app/preauth-manager/models/preauth-treatment-basket';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { PreAuthDiagnosisComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-diagnosis/preauth-diagnosis.component';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'preauth-icd10-edit',
  templateUrl: './preauth-icd10-edit.component.html',
  styleUrls: ['./preauth-icd10-edit.component.css']
})

export class PreauthIcd10EditComponent implements OnInit {

  @Input() preAuthId: number;
  @Input() isHospitalAuth: boolean;
  existingICD10Records: PreAuthIcd10Code[];
  existingTreatmentBaskets: PreAuthTreatmentBasket[];
  bodySides: any[];
  injuryTypes = [];
  icd10Codes: ICD10CodeModel[];
  treatmentBaskets: PreAuthTreatmentBasket[];
  addedTreatmentBaskets: PreAuthTreatmentBasket[];
  selectedTreatmentBasket: PreAuthTreatmentBasket;
  isICD10CodeExists = false;
  hideICD10CodeSearch = true;
  selectedICD10Codes: boolean = false;
  @Input() isClinicalUpdate: boolean = false;
  displayedColumns = ['icd10Code', 'description', 'bodySideId', 'injuryType', 'isClinicalUpdate', 'updateSequenceNo', 'authorizationCheck'];

  constructor(readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly preAuthService: MediCarePreAuthService,
    private readonly lookupService: LookupService,
  ) { }

  @ViewChild(PreAuthDiagnosisComponent, { static: true })
  private preAuthDiagnosisComponent: PreAuthDiagnosisComponent;

  ngOnInit() {
    this.loadData();
    this.initBodySides();
  }

  loadData(): void {
    this.existingICD10Records = [];
    this.existingTreatmentBaskets = [];
    this.bodySides = [];
    if (this.preAuthId > 0) {
      this.mediCarePreAuthService.getPreAuthorisationById(this.preAuthId).subscribe((data) => {
        if (data !== null) {
          this.existingICD10Records = data.preAuthIcd10Codes;
          this.setExistingICD10AndTreatmentBasketData(data.preAuthIcd10Codes);
        }
      });
    }
  }

  loadICD10CodeDataForClinicalUpdate(preAuthIcd10Codes: PreAuthIcd10Code[]): void {
    if (!isNullOrUndefined(preAuthIcd10Codes)) {
      this.existingICD10Records = [];
      this.existingICD10Records = preAuthIcd10Codes;
      //this.setExistingICD10AndTreatmentBasketData(preAuthIcd10Codes);
    }
  }

  loadTreatmentBasketDataForClinicalUpdate(preAuthTreatmentBaskets: PreAuthTreatmentBasket[]): void {
    if (!isNullOrUndefined(preAuthTreatmentBaskets)) {
      this.existingTreatmentBaskets = [];
      this.existingTreatmentBaskets = preAuthTreatmentBaskets;
    }
  }


  setExistingICD10AndTreatmentBasketData(data) {
    for (let i = 0; i < data.length; i++) {

      let x = data[i];

      this.preAuthService.getTreatmentBasketForICD10CodeId(x.icd10CodeId).subscribe(response => {
        if (!response) return;
        var treatmentBasketExists = this.existingTreatmentBaskets.some(t => t.treatmentBasketId === response.treatmentBasketId);
        if (!treatmentBasketExists) {
          this.existingTreatmentBaskets.push(response);
        }
      });
    };
  }

  onClickAddICD10Code(): void {
    this.hideICD10CodeSearch = !this.hideICD10CodeSearch;

  }

  onChange(item: PreAuthIcd10Code) {
    this.getExistingICD10Codes().find(x => x.preAuthIcd10CodeId == item.preAuthIcd10CodeId).isAuthorised = item.isAuthorised;
  }

  onChangeTreatmentBasket(item: PreAuthTreatmentBasket) {
    this.existingTreatmentBaskets.forEach((x) => {
      if (x.treatmentBasketId === item.treatmentBasketId) {
        x.isAuthorised = item.isAuthorised;
      }
    });
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

  initBodySides(): void {
    this.lookupService.getBodySides().subscribe(response => {
      if (!response) throw Error(`Failed to initialize lookups. The 'BodySides' lookup returned no results.`);
      response.forEach(x => { this.bodySides.push({ displayValue: x.name, id: x.id }) });
    });
  }

  populateForm(): void {

  }

  getExistingICD10Codes(): PreAuthIcd10Code[] {
    if (this.preAuthDiagnosisComponent) {
      let iCD10CodeList = this.existingICD10Records;
      return iCD10CodeList;
    }
  }

  getAddedICD10Codes(): PreAuthIcd10Code[] {
    if (this.preAuthDiagnosisComponent) {
      let iCD10CodeList = this.preAuthDiagnosisComponent.getICD10CodeList() as PreAuthIcd10Code[];
      return iCD10CodeList;
    }
  }

  getExistingTreatmentBaskets(): PreAuthTreatmentBasket[] {
    if (this.preAuthDiagnosisComponent) {
      let treatmentBasketList = this.existingTreatmentBaskets;
      return treatmentBasketList;
    }
  }

  getAddedTreatmentBaskets(): PreAuthTreatmentBasket[] {
    if (this.preAuthDiagnosisComponent) {
      let treatmentBasketList = this.preAuthDiagnosisComponent.getTreatmentBasketList() as PreAuthTreatmentBasket[];
      return treatmentBasketList;
    }
  }

}
