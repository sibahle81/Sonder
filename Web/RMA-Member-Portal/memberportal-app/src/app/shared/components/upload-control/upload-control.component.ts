import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, Output } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { BehaviorSubject, observable } from 'rxjs';
import 'rxjs';
import { UploadFile } from '../../models/upload-file.model';
import { AlertService } from '../../services/alert.service';
import { UploadService } from '../../services/upload-control.service';


import { Document } from '../../models/document.model';
import { EventEmitter } from '@angular/core';


/** @description Common upload control that saves to different locations */
@Component({
  templateUrl: './upload-control.component.html',
  // tslint:disable-next-line:component-selector
  selector: 'upload-control',
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
export class UploadControlComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  isUploading: boolean;
  isDocUploaded = false;
  uploadFileList: UploadFile[] = [];
  arrayOfFiles: Array<File>;
  @Input() label: string;
  @Input() acceptedTypes: string;
  @Input() name: string;
  @Input() maxFileSize = 10485760;
  @Input() isSingleInput = false;
  @Input() isReadOnly = false;
  @Input() allowDelete = false;
  @Input() isDocumentLoaded: boolean;
  state: string;
  documents: Document[];
  uploadChanged = new BehaviorSubject<UploadFile[]>(null);
  @Output() fileSelected = new EventEmitter<boolean>();

  constructor(
    private readonly alertService: AlertService,
    private readonly uploadService: UploadService) {
  }

  ngOnInit() {
    this.resetUpload();
  }

  resetUpload(): void {
    this.isUploading = false;
    this.arrayOfFiles = new Array<File>();
  }

  clearUploadedDocs(): void {
    this.uploadFileList = [];
  }

  /**
   * @description fires when files are selected for upload
   */
  onChange($event: any): void {
    this.readFiles($event.target.files);

    this.fileSelected.emit(true);
  }

  readFiles(files: Array<File>) {
    this.arrayOfFiles = files;
    if (this.validateNumberOfFiles(this.arrayOfFiles.length)
      && this.validateFileNames() && this.validateFileTypes() && this.validateSize()) {

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.arrayOfFiles.length; i++) {
        const file = new UploadFile();
        file.name = this.arrayOfFiles[i].name;
        file.isLoading = true;
        file.hasError = false;
        file.size = this.bytesToSize(this.arrayOfFiles[i].size);
        file.file = this.arrayOfFiles[i];
        this.uploadFileList.push(file);
      }
      this.isDocUploaded = true;
    }
    this.fileInput.nativeElement.value = '';
  }

  /**
   * @description gets list of uploaded files
   * @param UploadFile FileList Returns the list of files
   */
  getUploadedFiles(): UploadFile[] {
    return this.uploadFileList;
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

  delete(file: any): void {
    const index = this.uploadFileList.indexOf(file);
    if (index >= 0) {
      const item = this.uploadFileList[index];
      this.uploadFileList.splice(index, 1);
      this.uploadChanged.next(this.getUploadedFiles());
    }
  }
  /**
   * @description removes file from list.
   * @param file The file to remove from the list
   */
  remove(file: any): void {
    const index = this.uploadFileList.indexOf(file);

    if (index >= 0) {
      const item = this.uploadFileList[index];
      item.isLoading = true;
      this.uploadService.deleteFile(item).subscribe(result => {
        this.uploadFileList.splice(index, 1);
        this.uploadChanged.next(this.getUploadedFiles());
      }, error => {
        this.error(error);
        item.hasError = true;
        item.error = error;
      });
    }
  }

  /**
   * @description Cancels any operation and shows an error message.
   * @param any error The error message that was thrown from the service.
   */
  error(error: any): void {
    this.alertService.handleError(error);
  }

  /**
   * @description update
   */
  uploadFiles() {
    if (this.uploadFileList.length > 0) {
      this.isUploading = true;
      const formData: FormData = new FormData();
      for (const file of this.arrayOfFiles) {
        formData.append('uploadFiles', file, file.name);
        formData.append(file.name, this.bytesToSize(file.size));
      }
      this.uploadService.uploadFile(formData).subscribe(
        data => {
          this.isUploading = false;
          this.isDocumentLoaded = true;
        }, error => {
          this.error(error);
          this.isUploading = false;
          this.uploadChanged.next(null);
        }, () => {
          this.isUploading = false;
        }
      );
    }
  }

  reconstruct(data: UploadFile[]): void {
    for (const file of data) {
      const itemIndex = this.uploadFileList.findIndex(p => p.name.toLocaleLowerCase() === file.name.toLocaleLowerCase());
      if (itemIndex >= 0) {
        this.uploadFileList.splice(itemIndex, 1);
      }
      this.uploadFileList.push(file);
    }
  }

  validateFileNames(): boolean {
    for (const file of this.arrayOfFiles) {
      const itemIndex = this.uploadFileList.findIndex(p => p.name.toLocaleLowerCase() === file.name.toLocaleLowerCase());
      if (itemIndex >= 0) {
        this.alertService.error(`${file.name} has already been uploaded.`);
        return false;
      }
    }
    return true;
  }

  validateNumberOfFiles(fileCount: number): boolean {
    if (this.isSingleInput && fileCount > 1) {
      this.alertService.error('Please only select one file!');
      return false;
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

  validateFileTypes(): boolean {

    const fileTypeArray = this.acceptedTypes.split(',').map(i => i.replace('.', '').toLocaleUpperCase());

    for (const file of this.arrayOfFiles) {
      const fileExtention = file.name.substr(file.name.lastIndexOf('.') + 1).toLocaleUpperCase();
      const index = fileTypeArray.findIndex(item => item.toLocaleUpperCase() === fileExtention);
      if (index < 0) {
        this.alertService.error(`Incorrect file type for file: ${file.name}`);
        return false;
      }
    }
    return true;
  }

  bytesToSize(bytes: number, decimals?: number): string {
    if (bytes === 0) { return '0 Bytes'; }
    const k = 1024;
    const dm = decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  removeStale() {
    let index = 0;
    do {
      index = this.uploadFileList.findIndex(i => i.isLoading || i.hasError);
      if (index >= 0) {
        this.uploadFileList.splice(index, 1);
      }
    } while (index >= 0);
  }

  removeFile(index: number): void {
    if (index >= 0) {
      this.uploadFileList.splice(index, 1);
    }
  }
}
