import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';

@Component({
  templateUrl: './variance-dialog.component.html',
  styleUrls: ['./variance-dialog.component.css']
})
export class VarianceDialogComponent implements OnInit {

  form: UntypedFormGroup;

  documentSystemName = DocumentSystemNameEnum.WizardManager;
  documentSet = DocumentSetEnum.Declaration;
  allRequiredDocumentsUploaded: boolean;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<VarianceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      varianceReason: [{ value: null, disabled: this.data.isReadOnly }, Validators.required],
    });

    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      varianceReason: this.data.rolePlayerPolicyDeclaration.varianceReason ? this.data.rolePlayerPolicyDeclaration.varianceReason : null
    });
  }

  readForm() {
    this.data.rolePlayerPolicyDeclaration.allRequiredDocumentsUploaded = this.allRequiredDocumentsUploaded;
    this.data.rolePlayerPolicyDeclaration.varianceReason = this.form.controls.varianceReason.value && this.form.controls.varianceReason.value != '' ? this.form.controls.varianceReason.value : null;
  }

  isRequiredDocumentsUploaded(isUploaded: boolean) {
    this.allRequiredDocumentsUploaded = isUploaded;
  }

  close(): void {
    this.readForm();
    this.dialogRef.close(this.data);
  }

  submit(): void {
    this.readForm();
    this.dialogRef.close(this.data);
  }
}
