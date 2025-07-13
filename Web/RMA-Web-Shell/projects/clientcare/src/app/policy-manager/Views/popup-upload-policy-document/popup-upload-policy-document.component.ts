import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { PopupUploadDocumentComponent } from 'projects/shared-components-lib/src/lib/document-management/popup-upload-document/popup-upload-document.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UploadService } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.service';
import { PolicyService } from '../../shared/Services/policy.service';
import { UploadDocument } from '../../shared/entities/upload-documents';
import { RequiredDocument } from 'projects/admin/src/app/configuration-manager/Shared/required-document';

@Component({
  selector: 'app-popup-upload-policy-document',
  templateUrl: './popup-upload-policy-document.component.html',
  styleUrls: ['./popup-upload-policy-document.component.css']
})
export class PopupUploadPolicyDocumentComponent implements OnInit {

  @ViewChild('registrationDocuments') registrationDocumentsUploadControlComponent: UploadControlComponent;
  documentType = new UntypedFormControl();
  documentTypes: DocumentType[];
  selectedDocumentType: number;
  doc: Document;
  requiredDocs: RequiredDocument[];
  selectedDocumentId: number;
  showUploadControl: boolean;

  constructor(
    public dialogRef: MatDialogRef<PopupUploadPolicyDocumentComponent>,
    @Inject(MAT_DIALOG_DATA) public policyId: number,
    private readonly alertService: AlertService,
    private readonly uploadService: UploadService,
    private readonly policyService: PolicyService,
  ) { }

  ngOnInit() {
    const files = this.registrationDocumentsUploadControlComponent.getUploadedFiles();
    this.getRequiredDocs();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  documentTypeChange($event: any) {
    this.selectedDocumentType = $event.value as number;
  }

  UploadDocuments(): void {
    this.registrationDocumentsUploadControlComponent.isUploading = true;
    const files = this.registrationDocumentsUploadControlComponent.getUploadedFiles();

    for (const file of files) {
      const uploadDocument = new UploadDocument();
      uploadDocument.name = file.name;
      uploadDocument.documentToken = file.token;
      uploadDocument.policyId = this.policyId;
      uploadDocument.isActive = true;
      uploadDocument.requiredDocumentId = this.selectedDocumentId;

      this.policyService.addDocument(uploadDocument).subscribe(s => s);
    }
    this.dialogRef.close();
  }

  getRequiredDocs(): any {
    this.policyService.getRequiredDocuments().subscribe(results => {
      this.requiredDocs = results;
    });
  }

  getValue($event: { value: number; }) {
    this.selectedDocumentId = $event.value;
    this.showUploadControl = true;
  }

}
