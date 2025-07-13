import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ICD10CodeEntity } from '../../shared/entities/icd10-code-model';
import { EventTypeEnum } from '../../shared/enums/event-type-enum';
import { ICD10Category } from 'projects/medicare/src/app/medi-manager/models/icd10-category';
import { ICD10DiagnosticGroup } from 'projects/medicare/src/app/medi-manager/models/icd10-diagnostic-group';
import { ICD10SubCategory } from 'projects/medicare/src/app/medi-manager/models/icd10-sub-category';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PhysicalDamage } from '../../shared/entities/physical-damage';
import { Injury } from '../../shared/entities/injury';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { Constants } from '../../../constants';

@Component({
  selector: 'app-popup-icd10-additional',
  templateUrl: './popup-icd10-additional.component.html',
  styleUrls: ['./popup-icd10-additional.component.css']
})
export class PopupIcd10AdditionalComponent implements OnInit {
  diagnosticGroups: ICD10DiagnosticGroup[] = [];
  icdCategories: ICD10Category[] = [];
  icdSubCategories: ICD10SubCategory[] = [];
  icdCodes: ICD10Code[] = [];
  physicalDamages: PhysicalDamage[] = [];
  isUploading: boolean;
  message: string;
  hasDiagnostic = false;
  isViewOnly = false;
  drg = 0;
  severities: Lookup[] = [];
  bodySides: Lookup[] = [];
  form: UntypedFormGroup;
  user: User;
  codeDescription: any;
  constructor(
    public dialogRef: MatDialogRef<PopupIcd10AdditionalComponent>,
    public dialog: MatDialog,
    private readonly medicalService: ICD10CodeService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.isUploading = true;
    this.diagnosticGroups = this.data.diagnosticGroups;
    this.severities = this.data.severities;
    this.bodySides = this.data.bodySides;
    this.createForm();
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  createForm() {
    this.form = this.formBuilder.group({
      diagnosticGroup: [{ value: '', disabled: false }, [Validators.required]],
      briefDescription: [{ value: '', disabled: false }, [Validators.required]],
      icdCategory: [{ value: '', disabled: true }, [Validators.required]],
      icdSubCategory: [{ value: '', disabled: true }, [Validators.required]],
      icdCode: [{ value: '', disabled: true }, [Validators.required]],
      severity: [{ value: '', disabled: false }, [Validators.required]],
      bodySide: [{ value: '', disabled: false }, [Validators.required]],
    });

    this.setFormOnAction();
  }

  setFormOnAction() {
    switch (this.data.type) {
      case 'view':
        this.viewOnly();
        this.checkIfInternalUser();
        break;
      case 'edit':
        this.checkIfInternalUser();
        break;
    }
  }

  checkIfInternalUser() {
    if (this.user.isInternalUser && this.data.physicalDamage.icdCategoryId !== null) {
      this.form.patchValue({
        diagnosticGroup: this.data.physicalDamage.icd10DiagnosticGroupId,
      });
      this.getIcdCategories(this.data.physicalDamage.icd10DiagnosticGroupId, true);
    } else {
      this.patchForm();
    }
  }

  viewOnly() {
    this.disableFormControl('diagnosticGroup');
    this.disableFormControl('briefDescription');
    this.disableFormControl('icdCicdCategoryode');
    this.disableFormControl('icdSubCategory');
    this.disableFormControl('icdCode');
    this.disableFormControl('severity');
    this.disableFormControl('bodySide');

    this.isViewOnly = true;
  }
  patchForm() {
    this.form.patchValue({
      diagnosticGroup: this.data.physicalDamage.icd10DiagnosticGroupId,
      briefDescription: this.data.physicalDamage.description,
      icdCategory: this.data.physicalDamage.icdCategoryId,
      icdSubCategory: this.data.physicalDamage.icdSubCategoryId,
      icdCode: this.data.physicalDamage.injuries[0].icd10CodeId,
      severity: this.data.physicalDamage.injuries[0].injurySeverityType,
      bodySide: this.data.physicalDamage.injuries[0].bodySideAffectedType,
    });
  }

  submit(): void {
    this.setValidationsForUser();
    const formModel = this.form.value;
    if (this.form.status === 'INVALID') {
      this.alertService.error('Please complete form');
    } else {
      const damage = new PhysicalDamage();
      damage.injuries = [];
      damage.icd10DiagnosticGroupId = formModel.diagnosticGroup;
      damage.description = this.user.isInternalUser ? this.codeDescription : formModel.briefDescription;
      damage.icdCategoryId = this.user.isInternalUser ? formModel.icdCategory : 0;
      damage.icdSubCategoryId = this.user.isInternalUser ? formModel.icdSubCategory : 0;
      damage.count = this.data.physicalDamage ? this.data.physicalDamage.count : 0;
      damage.icd10SelectionType = this.data.type;

      const injury = new Injury();
      injury.icd10CodeId = this.user.isInternalUser ? formModel.icdCode : Constants.externalIcd10CodeInvalid;
      injury.injurySeverityType = formModel.severity;
      injury.bodySideAffectedType = formModel.bodySide;

      damage.injuries.push(injury);
      this.physicalDamages.push(damage);

      const data = {
        physicalDamages: this.physicalDamages
      };
      this.dialogRef.close(data);
    }
  }

  readForm(): any {
    const formModel = this.form.value;
    this.message = formModel.message;
    return formModel;
  }

  // Dropdown events
  drgChanged($event: any) {
    this.disableFormControl('icdCategory');
    this.disableFormControl('icdSubCategory');
    this.disableFormControl('icdCode');
    this.getIcdCategories($event.value, false);
    this.hasDiagnostic = true;
  }

  categoryChanged($event: any) {
    this.getIcdSubCategories($event.value, false);
  }
  codeChanged($event: any) {
    this.codeDescription = this.icdCodes.find(i => i.icd10CodeId === $event.value).icd10CodeDescription;
  }


  subCategoryChanged($event: any) {
    if ($event) {
      this.getIcdCodes($event.value, false);
    }
  }

  getIcdCategories(icd10DiagnosticGroupId: number, IsEdit: boolean) {
    this.drg = icd10DiagnosticGroupId;
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Accident;
    icdModel.ICD10DiagnosticGroupId = icd10DiagnosticGroupId;
    this.medicalService.getICD10CategoriesByEventTypeAndDiagnosticGroup(icdModel).subscribe(categories => {
      this.icdCategories = categories;
      if (IsEdit) {
        this.getIcdSubCategories(this.data.physicalDamage.icdCategoryId, true);
      } else {
        this.enableFormControl('icdCategory');
      }
    });
  }

  getIcdSubCategories(icdCategoryId: number, IsEdit: boolean) {
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Accident;
    icdModel.ICD10DiagnosticGroupId = this.drg;
    icdModel.ICD10CategoryId = icdCategoryId;
    this.medicalService.getICD10SubCategoriesByEventTypeDRGAndCategory(icdModel).subscribe(subCategories => {
      this.icdSubCategories = subCategories;
      if (IsEdit) {
        this.getIcdCodes(this.data.physicalDamage.icdSubCategoryId, true);
      } else {
        this.enableFormControl('icdSubCategory');
      }
    });
  }

  getIcdCodes(subcategoryId: number, IsEdit: boolean) {
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Accident;
    icdModel.ICD10DiagnosticGroupId = this.drg;
    icdModel.ICD10SubCategoryId = subcategoryId;
    this.medicalService.getICD10CodesByEventTypeDRGAndSubCategory(icdModel).subscribe(codes => {
      this.icdCodes = codes;
      if (IsEdit) {
        this.patchForm();
      } else {
        this.enableFormControl('icdCode');
      }
    });
  }

  getDiagnosticGroupsByEventTypeId(eventType: EventTypeEnum) {
    this.medicalService.getICD10DiagonosticGroupsByEventType(eventType).subscribe(groups => {
      this.diagnosticGroups = groups;
    });
  }

  getSeverities() {
    this.lookupService.getInjurySeverities().subscribe(severities => {
      this.severities = severities;
    });
  }

  enableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).enable();
    }
  }

  disableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).disable();
      this.form.patchValue({
        controlName: null
      });
    }
  }


  setValidationsForUser() {
    const validators = [Validators.required];
    if (this.user.isInternalUser) {
      this.applyValidationToFormControl(validators, 'diagnosticGroup');
      this.applyValidationToFormControl(validators, 'icdCategory');
      this.applyValidationToFormControl(validators, 'icdSubCategory');
      this.applyValidationToFormControl(validators, 'icdCode');
      this.applyValidationToFormControl(validators, 'severity');
      this.applyValidationToFormControl(validators, 'bodySide');
      this.clearValidationToFormControl('briefDescription');
    } else {
      this.applyValidationToFormControl(validators, 'diagnosticGroup');
      this.applyValidationToFormControl(validators, 'briefDescription');
      this.applyValidationToFormControl(validators, 'severity');
      this.applyValidationToFormControl(validators, 'bodySide');
      this.clearValidationToFormControl('icdCategory');
      this.clearValidationToFormControl('icdSubCategory');
      this.clearValidationToFormControl('icdCode');
    }
  }

  clearValidationToFormControl(controlName: string) {
    this.form.get(controlName).clearValidators();
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }

  applyValidationToFormControl(validationToApply: any, controlName: string) {
    this.form.get(controlName).setValidators(validationToApply);
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }


}
