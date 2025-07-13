import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DocumentManagementDataSource } from 'projects/shared-components-lib/src/lib/document-management/document-management.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { UploadService } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.service';
import { UploadFile } from 'projects/shared-components-lib/src/lib/upload-control/upload-file.class';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UploadDocument } from '../../shared/entities/upload-documents';
import { PolicyDocumentUpload } from '../policy-documents-upload/policy-documents-upload.component';
import { PopupUploadPolicyDocumentComponent } from '../popup-upload-policy-document/popup-upload-policy-document.component';
import { PolicyDocumentsListDataSource } from './policy-documents-list.datasource';

@Component({
    templateUrl: './policy-documents-list.component.html',
    selector: 'policy-documents-list'
})
export class PolicyDocumentsListComponent extends ListComponent implements OnInit {
    policyId: number;
    manageMode: boolean;
    uploadFile: UploadFile;

    get isLoading(): boolean { return this.dataSource.isLoading; }

    @ViewChild(PolicyDocumentUpload)
    policyDocumentUpload: PolicyDocumentUpload;

    constructor(
        alertService: AlertService,
        router: Router,
        public dialog: MatDialog,
        public documentDataSource: DocumentManagementDataSource,
        public uploadService: UploadService,
        readonly privateDataSource: PolicyDocumentsListDataSource) {
        super(alertService, router, privateDataSource, 'clientcare/policy-manager', 'Policy Documents', 'policy');
        this.hideAddButton = true;
        privateDataSource.defaultSortColumn = 'name';
    }

    ngOnInit(): void {
        super.ngOnInit();
    }


    getData(policyId: number): void {
        this.policyId = policyId;
        this.privateDataSource.getData(policyId);
        this.policyDocumentUpload.setPolicy(policyId);
    }


    onSelect(item: any): void {
        alert(this.policyId);
    }

    setupDisplayColumns(): void {
        this.columns = [
            {
                columnDefinition: 'requiredDocumentName',
                header: 'Document Type',
                cell: (row: UploadDocument) => `${row.requiredDocumentName}`
            },
            { columnDefinition: 'name', header: 'File Name', cell: (row: UploadDocument) => `${row.name}` },
            { columnDefinition: 'createdBy', header: 'Uploaded by', cell: (row: UploadDocument) => `${row.createdBy}` }
        ];
    }

    // Documents upload and download
    GetSelectedData(row) {
        this.uploadService.getUploadFileData(row.documentToken).subscribe(document => {
            this.uploadFile = document;
            const byteCharacters = atob(document.file);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const b: any = new Blob([byteArray], { type: this.uploadFile.mimeType });
            const url = window.URL.createObjectURL(b);
            window.open(url);
        });
    }

    openDialogUploadDocuments() {
        const dialogRef = this.dialog.open(PopupUploadPolicyDocumentComponent,
          {width: '1024px',
          data: this.policyId});

        dialogRef.afterClosed().subscribe(data => {
            this.getData(this.policyId);
        });
      }

      getDocumentDataValues(policyId: number) {
        this.documentDataSource.setControls(this.paginator, this.sort);
        this.documentDataSource.clearData();
        // this.getDocumentData(policyId);
      }

    //   getDocumentData(claimId: number) {
    //     (this.dataSource as DocumentManagementDataSource).getData(claimId);
    //    }

}
