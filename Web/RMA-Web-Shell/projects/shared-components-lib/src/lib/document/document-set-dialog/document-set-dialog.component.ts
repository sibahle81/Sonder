import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { BehaviorSubject } from 'rxjs';
import { DocumentComponent } from '../document.component';

@Component({
  templateUrl: './document-set-dialog.component.html',
  styleUrls: ['./document-set-dialog.component.css']
})

export class DocumentSetDialogComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  form: UntypedFormGroup;

  allDocumentSets: DocumentSetEnum[];

  constructor(
    public dialogRef: MatDialogRef<DocumentComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    this.getLookups();
  }

  getLookups() {
    this.allDocumentSets = this.ToArray(DocumentSetEnum);
    this.createForm();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      documentSets: [{ value: null, disabled: false }, [Validators.required]],
    });
  }

  readForm(): DocumentSetEnum[] {
    return this.form.controls.documentSets.value;
  }

  save() {
    const selectedDocumentSets = this.readForm();
    this.dialogRef.close(selectedDocumentSets);
  }

  close() {
    this.dialogRef.close(null);
  }

  getDocumentSet(documentSet: string): string {
    return this.formatText(documentSet);
  }

  formatText(text: string): string {
    return text ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : '<value missing from enum>';
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }
}
