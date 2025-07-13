import { ClaimAccidentCloseLetterTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-accident-close.lettertype.enum';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'close-accident-claim',
  templateUrl: './close-accident-claim.component.html',
  styleUrls: ['./close-accident-claim.component.css']
})
export class CloseAccidentClaimComponent implements OnInit {

  form: UntypedFormGroup;
  currentQuery: any;
  letterTypes: ClaimAccidentCloseLetterTypeEnum[];
  filteredLetterTypes: ClaimAccidentCloseLetterTypeEnum[];
  selectedOption: string;

  constructor(private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<CloseAccidentClaimComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.getLookups();
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      letterOption: [{ value: null, disabled: false }],
    });
  }

  getLookups() {
    this.letterTypes = this.ToArray(ClaimAccidentCloseLetterTypeEnum);
    this.filteredLetterTypes = this.letterTypes;
    const index = this.letterTypes.findIndex(e => e.toString() === ClaimAccidentCloseLetterTypeEnum[ClaimAccidentCloseLetterTypeEnum.Repuadiate])
    if (index > -1) {
      this.filteredLetterTypes.splice(index, 1);
    }
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  letterOptionChange($event: any) {
    this.selectedOption = $event;
  }

  submit(): void {
    this.setValidations();
    if (!this.form.valid) {
      return;
    }

    const data = this.selectedOption;
    this.dialogRef.close(data);
  }

  setValidations() {
    const validators = [Validators.required];
    this.applyValidationToFormControl(validators, 'letterOption');
  }

  applyValidationToFormControl(validationToApply: any, controlName: string) {
    this.form.get(controlName).setValidators(validationToApply);
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

}
