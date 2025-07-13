import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { MatDialog } from '@angular/material/dialog';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { ICD10CodeModel } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-model';
import { ICD10CodeService } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-service';
import { ICD10CodeFilterDialogComponent } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-filter-dialog.component';
import { BodySideAffectedTypeEnum } from 'projects/shared-models-lib/src/lib/enums/body-side-affected-type-enum';
import { InjurySeverityTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/injury-severity-type-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';
import { SourceSystemEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';

@Component({
  selector: 'medical-report-form-diagnosis',
  templateUrl: './medical-report-form-diagnosis.component.html',
  styleUrls: ['./medical-report-form-diagnosis.component.css']
})
export class MedicalReportFormDiagnosisComponent extends WizardDetailBaseComponent<ProgressMedicalReportForm> implements AfterViewInit, OnInit {

  form: UntypedFormGroup;
  minDate: Date;
  day = new Date().getDay().toString();
  year = (new Date().getFullYear() - 1).toString();
  isLoading = false;
  icd10Codes: ICD10CodeModel[];
  personEvent: any;
  documentSetType: DocumentSetEnum;
  isModernization: boolean;
  documentId: number;

  constructor(appEventsManager: AppEventsManager,
              authService: AuthService,
              activatedRoute: ActivatedRoute,
              private readonly dialog: MatDialog,
              private readonly formBuilder: UntypedFormBuilder,
              private readonly icd10CodeService: ICD10CodeService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.icd10Codes = [];
    if (this.model) {
      this.isModernization = this.model.medicalReportForm.medicalReportSystemSource === SourceSystemEnum.Modernisation;
      this.personEvent = this.isModernization ? this.model.medicalReportForm.personEventId : null;
      if (this.isModernization) {
        if (this.model.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.ProgressAccidentMedicalReport){
          this.documentSetType = DocumentSetEnum.DigiCareProgressMedicalReport;
        } else if (this.model.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.FinalAccidentMedicalReport){
          this.documentSetType = DocumentSetEnum.DigiCareFinalMedicalReport;
        } else {
          this.documentSetType = DocumentSetEnum.DigiCareFirstMedicalReport;
        }
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.model) {
      this.isModernization = this.model.medicalReportForm.medicalReportSystemSource === SourceSystemEnum.Modernisation;
      this.personEvent = this.isModernization ? this.model.medicalReportForm.personEventId : null;
      if (this.isModernization) {
        if (this.model.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.ProgressAccidentMedicalReport){
          this.documentSetType = DocumentSetEnum.DigiCareProgressMedicalReport;
        } else if (this.model.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.FinalAccidentMedicalReport){
          this.documentSetType = DocumentSetEnum.DigiCareFinalMedicalReport;
        } else {
          this.documentSetType = DocumentSetEnum.DigiCareFirstMedicalReport;
        }
      }
    }
  }

  //#region Wizard implementation
  createForm(id: number): void {

    this.form = this.formBuilder.group({
      icd10Codes: [''],
      icd10CodesJson: ['']
    });
  }

  onLoadLookups(): void {

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.form == null) return;

    if (!this.form.get("icd10Codes").value && this.isNotSet(this.form.get("icd10Codes").value)) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`At least 1 ICD10 code needs to be captured`);
    }
    return validationResult;
  }
  /*
  * Populates the form fields by mapping the relevant values from the internal data model to the respective
  *   form's input field.
  */
  populateForm(): void {

    // If the model is not initialised or 'this.icd10Codes' is initialised then there is nothing to do.

    if(!this.model || (this.icd10Codes && this.icd10Codes.length > 0)) return;

    this.isModernization = this.model.medicalReportForm.medicalReportSystemSource === SourceSystemEnum.Modernisation;
    this.personEvent = this.isModernization ? this.model.medicalReportForm.personEventId : null;
    if (this.model.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.ProgressAccidentMedicalReport){
      this.documentSetType = DocumentSetEnum.DigiCareProgressMedicalReport;
    } else if (this.model.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.FinalAccidentMedicalReport){
      this.documentSetType = DocumentSetEnum.DigiCareFinalMedicalReport;
    } else {
      this.documentSetType = DocumentSetEnum.DigiCareFirstMedicalReport;
    }

    if (this.isModernization) {
      if (this.model.medicalReportForm.documentId) {
        this.documentId = this.model.medicalReportForm.documentId;
      }
    }

    let icd10Codes = this.model.medicalReportForm.icd10Codes;

    if(!icd10Codes || icd10Codes.length === 0) return;

    this.form.controls.icd10Codes.setValue(this.model.medicalReportForm.icd10Codes);

    // split the list of ICD10-codes that is in the form 'S08.1, S09.2, etc..'

    let split = icd10Codes.split(", "); this.icd10Codes = [];

    // Retrieve the ICD10-code object for the extracted ICD10-code

    let icd10CodeJson = JSON.parse(this.model.medicalReportForm.icd10CodesJson);

    for(const x of split)

      this.icd10CodeService.filterICD10Code(x).subscribe(result=>{

        // If the result is empty do not continue.

        if(!result || result.length == 0)return;

        let record = result[0];

        let matchingIcd10CodeAdditionalDetails : any;


        for (const icd10Object of icd10CodeJson) {
          if (icd10Object.icd10Code == record.icd10Code)
            matchingIcd10CodeAdditionalDetails = icd10Object;
        }

        record["bodySideAffected"] = matchingIcd10CodeAdditionalDetails.bodySideAffected;
        record["bodySideComment"]  = matchingIcd10CodeAdditionalDetails.bodySideComment;
        record["severity"] = matchingIcd10CodeAdditionalDetails.severity;
        // Add the ICD10-code record to internal state.

        this.icd10Codes.push(record);
      });

  }

  /*
  * Populates the properties of the primary model, for this document/report/form, by mapping the
  *   user specified input values to the relevant model field.
  */
  populateModel(): void {

    if(!this.model) return;

    // Construct the list of select ICD10-codes into a string of the form 'S08.1, S09.2, etc..'

    let codes = "";
    let simplifiedCodes = [];
    for (const x of this.icd10Codes) {
      codes = codes + (codes.length > 0 ? `, ${x.icd10Code}` : x.icd10Code);

      let simplifiedCode = new ICD10CodeModel();

      simplifiedCode.icd10Code = x.icd10Code;
      simplifiedCode.bodySideComment = x.bodySideComment;
      simplifiedCode.bodySideAffected = x.bodySideAffected;
      simplifiedCode.severity = x.severity;

      simplifiedCodes.push(simplifiedCode);
  }

    this.model.medicalReportForm.icd10Codes  = codes;
    this.form.patchValue({icd10Codes:codes});

    this.model.medicalReportForm.icd10CodesJson = JSON.stringify(simplifiedCodes);
  }

/*
* Invoked when the 'X' button to the left of the icd10-code list item is clicked to remove that
*   specific list item.
*/
onItemRemoved(item:any):void{

  // Search the result collection, that is to be returned to the caller, for the index
  //   of the object that is to be removed, and remove it.

  let i = 0; for(; i < this.icd10Codes.length; i++) if(item.icd10CodeId === this.icd10Codes[i].icd10CodeId) break;

  this.icd10Codes.splice(i,1);
if(this.icd10Codes.length === 0)this.form.patchValue({icd10Codes:''});
  }

/*
* Displays the 'icd10-code-filter' dialog
*/
onShowDialogClick():void {

  let items:ICD10CodeModel[];items=[];

  // Display the 'icd10-code-filter' dialog

  let dialogRef = this.dialog.open(ICD10CodeFilterDialogComponent, {
    height: '40%',
    width: '80%',
    panelClass: 'custom-dialog',
    data: { resultItems:items },
  });

  // Handle the 'after-closed' event of the 'icd10-code-filter' dialog which is where
  //   the filtered results are returned the caller, namely 'this'.

  dialogRef.afterClosed().subscribe(result => {
    if ( !result ) return;
    for( const x of result.resultItems ) this.icd10Codes.push(x);
  });

}

isNotSet(str): boolean {
  return (!str || 0 === str.length || str === undefined);
}

getBodySideAffectedType(id: number) {
  return this.format(BodySideAffectedTypeEnum[id]);
}

getInjurySeverityType(id: number) {
  return this.format(InjurySeverityTypeEnum[id]);
}

format(text: string) {
  const status = text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim();
  return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
}

}
