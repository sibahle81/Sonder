import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { DocumentsRequest } from '../documents-request';
import { DocumentManagementService } from '../document-management.service';
import { AdditionalDocument } from '../additional-document';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { saveAs } from 'file-saver';
import { Document } from 'src/app/shared/components/document-management/document';
import { DocumentType } from 'src/app/shared/common//document-type';

@Component({
  selector: 'app-popup-additional-requirement',
  templateUrl: './popup-additional-requirement.component.html',
  styleUrls: ['./popup-additional-requirement.component.css']
})
export class PopupAdditionalRequirementComponent implements OnInit {
  form: FormGroup;
  documentTypes: DocumentType[];
  documentIds: number[];
  communicationMethodId = 1;
  test: DocumentsRequest;
  // @Output() clicked  = new EventEmitter<string>();

  constructor(
    public dialogRef: MatDialogRef<PopupAdditionalRequirementComponent>,
    private documentManagementService: DocumentManagementService,
    private readonly formBuilder: FormBuilder,
    private privateAppEventsManager: AppEventsManager,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  top: string[] = [];

  ngOnInit() {
    this.createForm();
    this.documentManagementService.GetAllDocumentsTypeNotInDocuments(this.data.documentRequest.documentSet).subscribe(documenttypes => {
      this.privateAppEventsManager.loadingStart('Getting Document Types');
      this.documentTypes = documenttypes;
      this.privateAppEventsManager.loadingStop();
    });
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  select(top): void {
    this.documentIds = [];
    this.top.push(top);
    this.documentIds.push(top.id);
  }

  send() {
    const additionalDocumentModel = this.readForm();
    this.dialogRef.close(additionalDocumentModel);
  }

  downloadDocument() {
    const additionalDocumentModel = this.readForm();

    for (const document of additionalDocumentModel.documentTypeIds) {
      this.documentManagementService.GetDocumentsToDownload(document).subscribe(documentData => {
        if (documentData.length > 0) {
          const byteCharacters = atob(documentData[0].attachmentByteData);

          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const b: any = new Blob([byteArray], {
            type: documentData[0].fileType
          });
          saveAs(b, documentData[0].fileName);
        }
      });
    }

    this.documentManagementService.DownloadAdditionalDocumentEmailTemplate(additionalDocumentModel).subscribe(documentData => {
      if (documentData) {
        const byteCharacters = atob(documentData.attachmentByteData);

        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const b: any = new Blob([byteArray], {
          type: documentData.fileType
        });
        saveAs(b, documentData.fileName);
      }
    });
    this.dialogRef.close(null);
  }

  createForm() {
    this.form = this.formBuilder.group({
      emailAddress: new FormControl(''),
      documentType: new FormControl(''),
      communicationMethod: new FormControl('')
    });
  }

  readForm() {
    this.form.disable();
    const formModel = this.form.value;
    const additionalDocumentModel = new AdditionalDocument();
    additionalDocumentModel.claimId = this.data.documentRequest.personEventId;
    additionalDocumentModel.email = formModel.emailAddress as string;
    additionalDocumentModel.documentTypeIds = formModel.documentType as [];
    additionalDocumentModel.documentSet = this.data.documentRequest.documentSet;
    additionalDocumentModel.keys = this.data.documentRequest.keys;
    additionalDocumentModel.system = this.data.documentRequest.system;
    additionalDocumentModel.communicationType = this.communicationMethodId;
    return additionalDocumentModel;
  }
}
