import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DocumentType } from 'projects/shared-models-lib/src/lib/common/document-type';
import { Document } from '../document';
import { DocumentManagementService } from '../document-management.service';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { DialogComponent } from '../../dialogs/dialog/dialog.component';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-popup-upload-document',
  templateUrl: './popup-upload-document.component.html',
  styleUrls: ['./popup-upload-document.component.css']
})
export class PopupUploadDocumentComponent implements OnInit {
  @ViewChild('registrationDocuments', { static: true }) registrationDocumentsUploadControlComponent: UploadControlComponent;
  documentType: DocumentType;
  keys: { [key: string]: string };
  isUploading: boolean;
  allowedDocumentTypes: string;
  documentSet: DocumentSetEnum;
  documentTypes: DocumentType[];
  form: UntypedFormGroup;
  isLoading: boolean;
  canClose = false;
  selectedId: any;
  documentDescription: string;


  constructor(
    public dialogRef: MatDialogRef<PopupUploadDocumentComponent>,
    private readonly alertService: AlertService,
    private readonly documentManagementService: DocumentManagementService,
    private readonly lookupService: LookupService,
    public dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.isLoading = true;
    this.isUploading = true;
    this.documentDescription = '';
    this.createForm();
    this.getAllowedDocumentTypes();
    if (this.data.item) {
      this.patchForm();
    }
    this.documentType = new DocumentType();
    this.keys = this.data.documentRequest.keys;
    this.documentSet = this.data.documentRequest.documentSet;
    this.getDocumentTypesByDocumentSet(this.documentSet);
  }

  getAllowedDocumentTypes() {
    this.lookupService.getItemByKey('AllowedDocumentTypes').subscribe(result => {
      this.registrationDocumentsUploadControlComponent.acceptedTypes = result;
      this.isLoading = false;
    });
  }

  getDocumentTypesByDocumentSet(documentSet: DocumentSetEnum) {
    this.documentManagementService.GetDocumentTypesBySetId(documentSet).subscribe(results => {
      this.documentTypes = results;
      this.isLoading = false;
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  bytesToSize(bytes: number, decimals?: number): string {
    if (bytes === 0) { return '0 Bytes'; }
    const k = 1024;
    const dm = decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  UploadDocuments(): void {
    this.isUploading = true;
    this.keys = this.data.documentRequest.keys;

    const selectedFiles = this.registrationDocumentsUploadControlComponent.getUploadedFiles();

    if (selectedFiles.length === 0) {
      this.isUploading = false;
      this.alertService.loading('Please select a file to upload', 'Upload file', false);
    } else {
      this.canClose = true;
      for (const file of selectedFiles) {
        const document = new Document();
        this.readForm();
        document.docTypeId = this.selectedId;
        document.systemName = this.data.documentRequest.system;
        document.fileName = file.name;
        document.keys = this.keys;
        document.documentStatus = DocumentStatusEnum.Received;
        document.documentStatusText = DocumentStatusEnum[DocumentStatusEnum.Received];
        document.fileExtension = file.file.type;
        document.documentSet = this.data.documentRequest.documentSet;
        document.documentDescription = this.documentDescription;
        // Use FileReader() object to get file to upload
        const reader = new FileReader();
        // Setup onload event for reader
        reader.onload = () => {
          // Store base64 encoded representation of file
          document.fileAsBase64 = reader.result.toString();
          // POST to server
          this.documentManagementService.UploadDocument(document).subscribe(result => {
            if (result.documentExist) {
              this.isUploading = false;
              this.openAlreadyExistDialog();
            } else {
              this.alertService.success('Document uploaded sucessfully');
              this.dialogRef.close(true);
            }
          });
        };
        // Read the file
        reader.readAsDataURL(file.file);
      }
    }
  }

  openAlreadyExistDialog(): void {
    const question = `Document already exists, please upload another PDF?`;
    const hideCloseBtn = true;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: { question, hideCloseBtn }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response !== null) {
        this.registrationDocumentsUploadControlComponent.clearUploadedDocs();
      }
    });
  }

  createForm() {
    this.form = this.formBuilder.group({
      documentType: [{ value: null }, Validators.required],
      documentDescription: []
    });
  }

  readForm(): void {
    this.selectedId = this.form.controls.documentType.value;
    this.documentDescription = this.form.controls.documentDescription.value;
  }

  onDocumentSelect() {
    this.form.markAsDirty();
    this.isUploading = false;
  }

  patchForm() {
    this.form.patchValue({
      documentType: this.data.item.docTypeId
    });

    this.onDocumentSelect();
  }
}
