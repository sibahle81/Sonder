import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Location } from '@angular/common';
import { RequiredDocument } from 'projects/admin/src/app/configuration-manager/Shared/required-document';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { UploadFile } from 'projects/shared-components-lib/src/lib/upload-control/upload-file.class';
import { UploadService } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.service';
import { PolicyDocumentService } from '../../shared/Services/policy-document.service';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { UploadDocument } from '../../shared/entities/upload-documents';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    templateUrl: './policy-documents-upload.component.html',
    styleUrls: ['./policy-documents-upload.component.css'],
    selector: 'policy-document-upload',
    animations: [
        trigger('dropboxState', [
            state('normal', style({
                backgroundColor: '#eee',
                transform: 'scale(1)'
            })),
            state('dragenter', style({
                backgroundColor: '#cfd8dc',
                transform: 'scale(4)'
            })),
            transition('normal => dragenter', animate('100ms ease-in')),
            transition('dragenter => normal', animate('100ms ease-out'))
        ])
    ]
})
export class PolicyDocumentUpload implements OnInit {
    @ViewChild('fileInput') fileInput: ElementRef;
    @Input() label: string;

    uploadFormGroup: UntypedFormGroup;
    documentCategories: Lookup[];
    selectedRequiredDocument: RequiredDocument;
    loading: boolean;
    state: string;
    acceptedTypes = '.pdf,.png,.jpg,.jpeg,.tiff';
    isUploading: boolean;
    maxFileSize = 4194304;
    uploadFileList: UploadFile[] = [];
    arrayOfFiles: Array<File>;
    requiredDocuments: RequiredDocument[];
    constructor(private readonly router: Router,
                private readonly alertService: AlertService,
                private readonly uploadService: UploadService,
                private readonly policyDocumentService: PolicyDocumentService,
                private readonly requiredDocumentService: RequiredDocumentService,
                private readonly location: Location) {
        this.createForm();
    }

    ngOnInit() {
        this.getRequiredDocument();
    }

    back(): void {
        this.router.navigate(['documents']);
    }

    readFiles(files: Array<File>) {
        this.arrayOfFiles = files;
        if (this.validateFileNames() && this.validateFileTypes() && this.validateSize()) {

            for (let i = 0; i < this.arrayOfFiles.length; i++) {
                const file = new UploadFile();
                file.name = this.arrayOfFiles[i].name;
                file.isLoading = true;
                file.hasError = false;
                file.size = this.bytesToSize(this.arrayOfFiles[i].size);
                this.uploadFileList.push(file);
            }
        }
    }

    validateFileNames(): boolean {
        for (const file of this.arrayOfFiles) {
            const itemIndex = this.uploadFileList.findIndex(p => p.name.toLowerCase() === file.name.toLowerCase());
            if (itemIndex >= 0) {
                this.alertService.error(`${file.name} has already been uploaded.`);
                return false;
            }
        }
        return true;
    }

    validateFileTypes(): boolean {
        const fileTypeArray = this.acceptedTypes.split(',').map(i => i.replace('.', '').toUpperCase());
        for (const file of this.arrayOfFiles) {
            const fileExtension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
            const index = fileTypeArray.findIndex(item => item.toUpperCase() === fileExtension);
            if (index < 0) {
                this.alertService.error(`Incorrect file type for file: ${file.name}`);
                return false;
            }
        }
        return true;
    }

    validateSize(): boolean {
        let size = 0;
        for (const file of this.arrayOfFiles) {
            size += file.size;
        }
        if (size < this.maxFileSize) {
            return true;
        } else {
            this.alertService.error(`File size exceeds maximum size of ${this.bytesToSize(this.maxFileSize)}`);
            return false;
        }
    }

    bytesToSize(bytes: number, decimals?: number): string {
        if (bytes === 0) { return '0 Bytes'; }
        const k = 1024;
        const dm = decimals || 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    onChange($event: any): void {
        this.readFiles($event.target.files);
    }


    getRequiredDocument(): void {
        this.loading = true;
        this.requiredDocumentService.getRequiredDocuments().subscribe(documents => {
            if (this.requiredDocuments != null) {
                this.requiredDocuments =
                    documents.filter(x => x.documentCategoryName.toLowerCase() === 'personal details documents' &&
                        x.module.trim().toLowerCase() === 'policy');
                this.loading = false;
            }},
            () => {
                this.loading = false;
            });
    }

    handleUpload(fileList: UploadFile[]) {
        this.uploadFileList = fileList;
    }

    createForm(): void {
        this.uploadFormGroup = new UntypedFormGroup({
            requiredDocument: new UntypedFormControl(''),
            policyId: new UntypedFormControl('')
        });
    }


    setPolicy(policyId: number): void {
        if (!this.uploadFormGroup) { this.createForm(); }
        this.uploadFormGroup.patchValue({ policyId });
    }

    uploadFiles() {
        if (this.uploadFileList.length > 0) {
            this.isUploading = true;
            const formData: FormData = new FormData();

            for (let i = 0; i < this.arrayOfFiles.length; i++) {
                formData.append('uploadFiles', this.arrayOfFiles[i], this.arrayOfFiles[i].name);
                formData.append(this.arrayOfFiles[i].name, this.bytesToSize(this.arrayOfFiles[i].size));
            }

            this.uploadService.uploadFile(formData).subscribe(
                data => this.uploadSuccess(data),
                error => this.uploadFailed(error));
        }
    }

    uploadSuccess(uploadFiles: UploadFile[]): void {
        this.uploadFileList = uploadFiles;
        this.fileInput.nativeElement.value = '';
        this.reconstruct(uploadFiles);

        let count = 0;
        uploadFiles.forEach(file => {
            const policyDocument = new UploadDocument();
            policyDocument.documentToken = file.token;
            policyDocument.policyId = this.uploadFormGroup.controls.policyId.value;
            policyDocument.requiredDocumentId = this.selectedRequiredDocument.id;
            policyDocument.name = file.name;
            this.policyDocumentService.addDocument(policyDocument).subscribe(() => {
                count++;
                if (count === uploadFiles.length) {
                    this.isUploading = false;
                    this.alertService.success('Files successfully uploaded', 'Upload Complete');
                    this.clear();
                    this.location.back();
                }
            });
        });
    }

    uploadFailed(error: any): void {
        this.alertService.handleError(error);
        this.isUploading = false;
    }

    reconstruct(data: UploadFile[]): void {
        for (const file of data) {
            const itemIndex = this.uploadFileList.findIndex(p => p.name.toLowerCase() === file.name.toLowerCase());
            if (itemIndex >= 0) {
                this.uploadFileList.splice(itemIndex, 1);
            }
            this.uploadFileList.push(file);
        }
    }

    clear(): void {
        this.uploadFileList = new Array();
        this.selectedRequiredDocument = this.requiredDocuments[0];
    }

    remove(file: any): void {
        const index = this.uploadFileList.indexOf(file);

        if (index >= 0) {
            const item = this.uploadFileList[index];
            item.isLoading = true;
            this.uploadFileList.splice(index, 1);
            this.fileInput.nativeElement.value = '';
        }
    }

    onRequiredDocumentChanged(event: any): void {
        if (event) {
            this.selectedRequiredDocument = event.value;
        }
    }

    dragenter($event: any): void {
        this.state = 'dragenter';
        $event.stopPropagation();
        $event.preventDefault();
    }
    openUploadFile($event: any) {
        this.fileInput.nativeElement.click();
    }
    dragover($event: any): void {
        // this.state = 'dragover';
        $event.stopPropagation();
        $event.preventDefault();
    }
    drop($event: any): void {
        this.state = 'uploading';
        $event.stopPropagation();
        $event.preventDefault();
        const dt = $event.dataTransfer;
        const files = dt.files;
        this.readFiles(files);
    }
    dragleave($e: any): void {
        this.state = 'normal';
    }
}
