import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DocumentSystemNameEnum } from '../../document/document-system-name-enum';

@Component({
  templateUrl: './document-uploader-dialog.component.html'
})
export class DocumentUploaderDialogComponent {

  documentSystemName: DocumentSystemNameEnum // required: name of module 
  documentSet: DocumentSetEnum; // required: document set to be made available for upload
  keyName: string; // required: document index name
  keyValue: string; // required: document index value

  title = 'Documents Required'; // optional: default title but can be overridden
  documentTypeFilter: DocumentTypeEnum[]; // optional: filtered subset of the documents to display if not all documents in the document set are needed
  forceRequiredDocumentTypeFilter: DocumentTypeEnum[]; // optional: filtered subset of the documents in the filteredDocumentTypes that are to be made required
  isReadOnly = false;

  allRequiredDocumentsUploaded = false;

  constructor(
    public dialogRef: MatDialogRef<DocumentUploaderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.documentSystemName = data.documentSystemName;
    this.documentSet = data.documentSet;
    this.keyName = data.keyName;
    this.keyValue = data.keyValue;
    this.title = data.title ? data.title : this.title;
    this.documentTypeFilter = data.documentTypeFilter ? data.documentTypeFilter : [];
    this.forceRequiredDocumentTypeFilter = data.forceRequiredDocumentTypeFilter ? data.forceRequiredDocumentTypeFilter : [];
    this.isReadOnly = data.isReadOnly ? data.isReadOnly : false;
  }

  isRequiredDocumentsUploaded($event: boolean) {
    this.allRequiredDocumentsUploaded = $event;
  }

  confirm() {
    this.dialogRef.close(this.allRequiredDocumentsUploaded);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
