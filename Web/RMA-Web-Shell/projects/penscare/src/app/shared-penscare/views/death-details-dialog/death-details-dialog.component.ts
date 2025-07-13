import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
@Component({
  selector: 'app-death-details-dialog',
  templateUrl: './death-details-dialog.component.html',
  styleUrls: ['./death-details-dialog.component.css']
})
export class DeathDetailsDialogComponent implements OnInit {
  personEventId = 0;
  form: UntypedFormGroup;
  allRequiredDocumentsUploaded = false;
  documentSet = DocumentSetEnum.CommonPersonalDocuments;
  documentSystemName = DocumentSystemNameEnum.PensCareManager;
  forceRequiredDocumentTypeFilter = [DocumentTypeEnum.DeathCertificate];
  showSubmit = true;
  title = "Death Details";
  
  @Output() refreshEmit = new EventEmitter<boolean>();
  @Output() requiredDocumentsUploaded = new EventEmitter<boolean>();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<DeathDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.personEventId = this.data?.personEventId;
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      deathDate: [null, [Validators.required]]
    });
  }

  submit() {
    this.dialogRef.close({ deathDate: new Date(this.form.get('deathDate').value) });
  }

  close() {
    this.dialogRef.close(null);
  }

  isRequiredDocumentsUploaded(isUploaded: boolean) {
    this.allRequiredDocumentsUploaded = isUploaded;
    this.requiredDocumentsUploaded.emit(this.allRequiredDocumentsUploaded);
  }
}
