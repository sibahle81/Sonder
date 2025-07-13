import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentStatusEnum } from 'src/app/shared/enums/document-status.enum';
import { AlertService } from 'src/app/shared/services/alert.service';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { DialogComponent } from '../../dialog/dialog.component';
import { UploadControlComponent } from '../../upload-control/upload-control.component';
import { DocumentManagementService } from '../document-management.service';
import { Document } from 'src/app/shared/components/document-management/document';
import { DocumentType } from 'src/app/shared/common//document-type';
import { BrokerPolicyService } from 'src/app/broker/services/broker-policy-service';
import { DocumentSetEnum } from 'src/app/shared/enums/document-set.enum';
import { DocumentCategoryType } from 'src/app/shared/models/document-category-type';
import { UpdateAffordabilityCheck } from '../update-afforbability-check';

@Component({
  selector: 'app-popup-upload-document',
  templateUrl: './popup-upload-document.component.html',
  styleUrls: ['./popup-upload-document.component.css']
})
export class PopupUploadDocumentComponent implements OnInit {
  @ViewChild('registrationDocuments') registrationDocumentsUploadControlComponent: UploadControlComponent;
  documentType: DocumentType;
  keys: { [key: string]: string };
  isUploading: boolean;
  hasFile = false;
  allowedDocumentTypes: string;

  constructor(
    public dialogRef: MatDialogRef<PopupUploadDocumentComponent>,
    private readonly alertService: AlertService,
    private readonly documentManagementService: DocumentManagementService,
    private readonly policyService: BrokerPolicyService,
    private readonly lookupService: LookupService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.isUploading = true;

    this.getAllowedDocumentTypes();

    this.documentType = new DocumentType();
    this.documentType.id = this.data.item.docTypeId;
    this.documentType.name = this.data.item.documentTypeName;
    this.keys = this.data.documentRequest.keys;

    this.isUploading = false;
  }

  getAllowedDocumentTypes() {
    this.lookupService.getItemByKeyAnon('AllowedDocumentTypes').subscribe(result => {
      this.registrationDocumentsUploadControlComponent.acceptedTypes = result;
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
    this.hasFile = false;
    this.keys = this.data.documentRequest.keys;
    const selectedFiles = this.registrationDocumentsUploadControlComponent.getUploadedFiles();

    if (selectedFiles.length === 0) {
      this.isUploading = false;
      this.alertService.error('Please select a document type and file to upload', 'Upload file', false);
    } else {
      for (const file of selectedFiles) {
        const document = new Document();
        document.docTypeId = this.data.item.docTypeId;
        document.systemName = this.data.documentRequest.system;
        document.fileName = file.name;
        document.keys = this.keys;
        document.documentStatus = DocumentStatusEnum.Received;
        document.documentStatusText = DocumentStatusEnum[DocumentStatusEnum.Received];
        document.fileExtension = file.file.type;
        document.documentSet = this.data.documentRequest.documentSet;
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

  fileSelected(event: any) {
    if (event) {
      this.hasFile = true;
    }
  }
}
