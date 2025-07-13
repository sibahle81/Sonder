import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UnSubscribe } from 'src/app/shared/common/unsubscribe';
import { DocumentSetEnum } from 'src/app/shared/enums/document-set.enum';
import { DocumentStatusEnum } from 'src/app/shared/enums/document-status-enum';
import { DocumentSystemNameEnum } from 'src/app/shared/enums/document-system-name-enum';
import { DocumentTypeEnum } from 'src/app/shared/enums/document-type.enum';
import { GenericDocument } from 'src/app/shared/models/generic-document';
import { UploadControlComponent } from '../../upload-control/upload-control.component';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from 'src/app/core/models/security/user.model';
import { DocumentManagementService } from '../../document-management/document-management.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { Document } from 'src/app/shared/components/document-management/document';
import { DocumentType } from 'src/app/shared/common//document-type';
import { DefaultConfirmationDialogComponent } from '../../dialog/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'document-uploader',
  templateUrl: './document-uploader.component.html',
  styleUrls: ['./document-uploader.component.css']
})

export class DocumentUploaderComponent extends UnSubscribe implements OnChanges {

  requiredAuditPermission = 'View Audits';
  requiredDeleteDocumentPermission = 'Delete Document';
  requiredStatusPermission = 'Update Document Status';

  // REQUIRED
  @Input() documentSet: DocumentSetEnum; // rquired: to get documents to upload
  @Input() systemName: DocumentSystemNameEnum // required: to identify between different areas in the system
  @Input() keyName: string; // required: for indexing
  @Input() keyValue: string; // required: for indexing

  // OPTIONAL
  @Input() documentTypeFilter: DocumentTypeEnum[]; // optional: filter to view only certain documents wihin the given document set input else all documents will display
  @Input() forceRequiredDocumentTypeFilter: DocumentTypeEnum[]; // optional: filter to make only certain documents wihin the given document set input required if needed
  @Input() acceptedDocumentFormats = '.pdf,.jpg,.png,.wma,.msg,.xls,.xlsx,.doc,.docx,.csv'; // optional:  default is all but can be set
  @Input() isReadOnly: boolean; // optional: force readonly
  @Input() canDelete = false;
  @Input() showDocumentStatusButton = true; // optional: override if you want to show the document status button
  @Input() expiryDate: Date; // optional: override the date used to calculate number of days to expiry documentType.validDays must be set to -1
  @Input() triggerReset: boolean;
  @Input() documentUploadStatus = DocumentStatusEnum.Received; // optional: override the document status else use the default

  @Output() requiredDocumentsUploadedEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() emitAllDocuments: EventEmitter<GenericDocument[]> = new EventEmitter();
  @Output() documentUploadingEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() documentUploadedEmit: EventEmitter<GenericDocument> = new EventEmitter();
  @Output() documentDeletedEmit: EventEmitter<GenericDocument> = new EventEmitter();
  @Output() documentComponentReadyEmit: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('uploadDocuments', { static: false }) uploadControlComponent: UploadControlComponent;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isUploading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  documentSets: DocumentSetEnum[];
  documentTypes: DocumentTypeEnum[];
  allDocuments: GenericDocument[];
  documents$: Observable<GenericDocument[]>;

  selectedDocuments: GenericDocument[] = [];

  documentTypesObj: DocumentType[];

  selectedDocumentSet: DocumentSetEnum;
  selectedDocumentType: DocumentTypeEnum;

  showUploader: boolean;

  requiredDocumentTypes: DocumentType[] = [];
  expiredDocumentTypes: DocumentType[] = [];
  documentDescription = '';
  menu: any;
  document: any;
  supportedDocumentTypes: string[] = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];

  currentUser: User;

  menus: { title: string, disable: boolean }[] = [
    { title: DocumentStatusEnum[DocumentStatusEnum.Accepted], disable: false },
    { title: DocumentStatusEnum[DocumentStatusEnum.Rejected], disable: false },
    { title: DocumentStatusEnum[DocumentStatusEnum.Waived], disable: false },
  ];

  constructor(
    private readonly documentManagementService: DocumentManagementService,
    private readonly authService: AuthService,
    private readonly datePipe: DatePipe,
    public dialog: MatDialog,
    private readonly alert: ToastrManager
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.keyName && this.keyValue && this.systemName && this.documentSet) {
      this.getData();
    }
  }

  getData() {
    this.isLoading$.next(false);
    let documents: GenericDocument[] = []
    this.allDocuments = this.filterOnSystemNameAndDocumentSet(documents);
    this.getUniqueDocumentSets(this.allDocuments);
    this.getUniqueDocumentTypes(this.documentSet);
    this.emitAllDocuments.emit(this.allDocuments);
  }

  filterOnSystemNameAndDocumentSet(documents: GenericDocument[]): GenericDocument[] {
    return documents.filter(s => s.systemName === DocumentSystemNameEnum[this.systemName] && s.documentSet === this.documentSet && s.isMemberVisible);
  }

  getUniqueDocumentSets(documents: GenericDocument[]) {
    this.documentSets = []
    documents.forEach(doc => {
      let exist = this.documentSets?.indexOf(doc.documentSet, 0);
      if (exist != -1) {
        this.documentSets.push(doc.documentSet);
      }
    });
  }

  getUniqueDocumentTypes(documentSet: DocumentSetEnum) {
    this.isLoading$.next(false);
    this.selectedDocumentSet = documentSet;
    this.documentTypes = [];

    this.documentManagementService.getDocumentTypesBySetId(this.selectedDocumentSet).subscribe(results => {
      if (results?.length) {
        this.documentTypesObj = results;

        const documentTypeSet = new Set(this.documentTypes);
        const updatedRequiredDocuments: any[] = [];

        results.forEach(s => {
          const isFiltered = this.documentTypeFilter?.includes(s.id);
          const isForceFiltered = this.forceRequiredDocumentTypeFilter?.includes(s.id);

          // Add unique document types based on filter conditions
          if (!documentTypeSet.has(s.id) && (isFiltered || !this.documentTypeFilter?.length)) {
            documentTypeSet.add(s.id);
          }

          // Process required document types and sync with forceRequiredDocumentTypeFilter
          if (s.documentSetDocumentTypes?.length) {
            s.documentSetDocumentTypes.forEach(t => {
              if ((t.required && t.documentSet === Number(this.selectedDocumentSet)) || isForceFiltered) {
                if (!updatedRequiredDocuments.some(doc => doc.id === s.id)) {
                  updatedRequiredDocuments.push(s);
                }
                this.isExpired(s.id);
              }
            });
          }
        });

        // Sync requiredDocumentTypes with forceRequiredDocumentTypeFilter
        this.requiredDocumentTypes = updatedRequiredDocuments.filter(doc =>
          doc.documentSetDocumentTypes.some(t =>
            t.required && t.documentSet === Number(this.selectedDocumentSet)
          ) || this.forceRequiredDocumentTypeFilter?.includes(doc.id)
        );

        // Make sure that if the documentset is filtered then sync the requiredDocumentTypes match the filter
        if (this.documentTypeFilter?.length > 0) {
          this.requiredDocumentTypes = this.requiredDocumentTypes.filter(s => this.documentTypeFilter?.includes(s.id));
        }

        // Convert Set back to array
        this.documentTypes = Array.from(documentTypeSet);
      }

      this.emitRequiredDocumentsUploaded();
      this.documentComponentReadyEmit.emit(true);
      this.isLoading$.next(false);
    });
  }

  getDocuments(documentType: DocumentTypeEnum) {
    this.selectedDocumentType = documentType;
    this.documents$ = null;
    this.documents$ = of(this.allDocuments.filter(s => s.documentType === documentType && s.documentSet === this.selectedDocumentSet));

    const count = this.allDocuments.filter(s => s.documentType === documentType && s.documentSet === this.selectedDocumentSet)?.length;
    if (!count || count <= 0) {
      this.toggleUploader();
    }
  }

  uploadMore(documentType: DocumentTypeEnum) {
    this.selectedDocumentType = documentType;
    this.documents$ = null;
    this.documents$ = of(this.allDocuments.filter(s => s.documentType === documentType && s.documentSet === this.selectedDocumentSet));
    this.toggleUploader();
  }

  getDocumentCount(documentType: DocumentTypeEnum): number {
    const documents = this.allDocuments.filter(s => s.documentType === documentType && s.documentSet === this.selectedDocumentSet);
    return documents?.length;
  }

  isExpired(documentType: DocumentTypeEnum): boolean {
    let documents = this.allDocuments.filter(s => s.documentType === documentType && s.documentSet === this.selectedDocumentSet).sort((a, b) => {
      return <any>new Date(b.createdDate) - <any>new Date(a.createdDate);
    });

    const documentTypeObj = this.documentTypesObj.find(s => s.id == documentType);
    const validDays = documentTypeObj.validDays ? +documentTypeObj.validDays : 0;

    const days = this.getDaysTillExpired(documentType);
    const isExpired = documents && documents?.length > 0 && validDays != 0 && days < 0;

    if (isExpired) {
      this.expiredDocumentTypes.push(documentTypeObj);
    }

    return isExpired;
  }

  getConfiguredValidDays(documentType: DocumentTypeEnum): number {
    let documents = this.allDocuments.filter(s => s.documentType === documentType && s.documentSet === this.selectedDocumentSet).sort((a, b) => {
      return <any>new Date(b.createdDate) - <any>new Date(a.createdDate);
    });

    const documentTypeObj = this.documentTypesObj.find(s => s.id == documentType);
    return documentTypeObj.validDays ? +documentTypeObj.validDays : 0;
  }

  getDaysTillExpired(documentType: DocumentTypeEnum): number {
    let documents = this.allDocuments.filter(s => s.documentType === documentType && s.documentSet === this.selectedDocumentSet).sort((a, b) => {
      return <any>new Date(b.createdDate) - <any>new Date(a.createdDate);
    });

    const documentTypeObj = this.documentTypesObj.find(s => s.id == documentType);
    const validDays = documentTypeObj.validDays ? +documentTypeObj.validDays : 0;

    if (documents && documents?.length > 0) {
      if (validDays > 0) {
        return validDays - this.calculateDays(new Date(documents[0].createdDate), new Date());
      }

      if (this.expiryDate && validDays < 0) {
        return this.calculateDays(new Date(), new Date(this.expiryDate));
      }
    }
  }

  emitRequiredDocumentsUploaded() {
    let isValid = this.requiredDocumentTypes.length === 0 ||
      this.requiredDocumentTypes.every(documentType =>
        this.allDocuments.some(d => d.documentType === documentType.id)
      );

    if (isValid) {
      isValid = this.expiredDocumentTypes.every(documentType =>
        !this.isExpired(documentType.id)
      );
    }

    this.requiredDocumentsUploadedEmit.emit(isValid);
  }


  isRequired(documentType: DocumentTypeEnum): boolean {
    return this.requiredDocumentTypes.some(s => s.id == documentType)
  }

  getDocumentSet(documentSet: DocumentSetEnum): string {
    return this.formatText(DocumentSetEnum[documentSet]);
  }

  getDocumentStatus(documentType: DocumentTypeEnum) {
    if (documentType <= 0) { return 'Received' };
    let document = this.allDocuments.find(a => a.documentType == documentType);
    return this.formatText(DocumentStatusEnum[document.documentStatus]);
  }

  getDocumentStatusName(documentStatus: DocumentStatusEnum) {
    return this.formatText(DocumentStatusEnum[documentStatus]);
  }

  getDocumentType(documentType: DocumentTypeEnum): string {
    return this.formatText(DocumentTypeEnum[documentType]);
  }

  formatText(text: string): string {
    return text ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : '<value missing from enum>';
  }

  closeDocumentTypes() {
    this.documentTypes = null;
    this.selectedDocumentSet = null;
  }

  closeDocuments() {
    this.selectedDocumentType = null;
    this.documents$ = null;
  }

  toggleUploader() {
    if (!this.isReadOnly) {
      this.showUploader = !this.showUploader;
    }
  }

  save(documentType: DocumentTypeEnum) {

    this.isUploading$.next(true);
    this.documentUploadingEmit.emit(true);

    const uploadedFiles = this.uploadControlComponent.getUploadedFiles();

    for (const file of uploadedFiles) {
      const document = new Document();
      document.docTypeId = documentType;
      document.systemName = DocumentSystemNameEnum[this.systemName];
      document.fileName = file.name;
      document.keys = this.getKeys();
      document.documentStatus = DocumentStatusEnum.Received;
      document.documentStatusText = DocumentStatusEnum[DocumentStatusEnum.Received];
      document.fileExtension = file.file.type;
      document.documentSet = DocumentSetEnum[this.documentSet];
      // Use FileReader() object to get file to upload
      const reader = new FileReader();
      // Setup onload event for reader
      reader.onload = () => {
        // Store base64 encoded representation of file
        document.fileAsBase64 = reader.result.toString();
        // POST to server
        this.documentManagementService.UploadDocument(document).subscribe(result => {

          let newDoc = new GenericDocument();
          newDoc.id = result.id;
          newDoc.documentType = documentType;
          newDoc.fileExtension = file.file.type;
          newDoc.fileName = file.name;
          newDoc.keyName = this.keyName;
          newDoc.keyValue = this.keyValue;
          newDoc.documentStatus = DocumentStatusEnum.Received;
          newDoc.documentSet = this.selectedDocumentSet;
          newDoc.documentDescription = this.documentDescription;
          newDoc.systemName = DocumentSystemNameEnum[this.systemName];
          newDoc.documentUri = result.documentUri;
          newDoc.required = result.required;
          newDoc.isMemberVisible = result.isMemberVisible;
          newDoc.createdDate = result.createdDate

          this.allDocuments.push(newDoc);
          this.documents$.subscribe(s => s.push(newDoc));

          this.toggleUploader();
          this.uploadControlComponent.clearUploadedDocs();
          this.isUploading$.next(false);

        });
      };
      // Read the file
      reader.readAsDataURL(file.file);
    }

  }

  downloadDocument(genericDocument: GenericDocument) {
    this.isLoading$.next(true);
    this.documentManagementService.GetDocumentBinary(genericDocument.id).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
      const byteCharacters = atob(result.fileAsBase64);

      const byteNumbers = new Array(byteCharacters?.length);
      for (let i = 0; i < byteCharacters?.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const b: any = new Blob([byteArray], {
        type: result.mimeType
      });

      saveAs(b, genericDocument.fileName);
      this.isLoading$.next(false);
    });
  }

  openInNewTab(genericDocument: GenericDocument) {
    this.isLoading$.next(true);
    this.documentManagementService.GetDocumentBinary(genericDocument.id).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
      if (!this.supportedDocumentTypes.includes(result.mimeType)) {
        this.alert.infoToastr('only pdf, jpg, png & plain text documents are supported when opening in a new tab');
        this.isLoading$.next(false);
        return;
      }

      const byteArray = this.base64ToUint8Array(result.fileAsBase64);

      const blob = new Blob([byteArray], { type: result.mimeType });
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank');
      URL.revokeObjectURL(objectUrl);

      this.isLoading$.next(false);
    });
  }

  base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  getKeys(): { [key: string]: string } {
    return { [this.keyName]: `${this.keyValue}` };
  }

  updateDocument(document: GenericDocument) {
    this.documentManagementService.updateDocumentGeneric(document).subscribe((result) => {
      if (document.isDeleted) {
        this.documentDeletedEmit.emit(document);
      }

      this.closeDocuments();
    });
  }

  confirmDelete(menu: any, document: GenericDocument, isDelete: boolean) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Delete Document(s)?`,
        text: 'Document(s) will be deleted. Would you like to proceed?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onMenuItemClick(menu, document, isDelete);
      }
    });
  }

  onMenuItemClick(menu: any, document: GenericDocument, isDelete: boolean): void {
    this.isLoading$.next(true);
    if (this.selectedDocuments && this.selectedDocuments?.length > 0) {
      this.selectedDocuments.forEach(s => {
        let item = new GenericDocument();
        item.id = s.id;
        item.documentSet = s.documentSet;
        item.documentType = s.documentType;
        item.documentStatus = isDelete ? DocumentStatusEnum.Deleted : +DocumentStatusEnum[menu.title];
        item.isDeleted = isDelete;
        this.updateDocument(item);
      });

      this.selectedDocuments = [];
    } else {
      let item = new GenericDocument();
      item.id = document.id;
      item.documentSet = document.documentSet;
      item.documentType = document.documentType;
      item.documentStatus = isDelete ? DocumentStatusEnum.Deleted : +DocumentStatusEnum[menu.title];
      item.isDeleted = isDelete;
      this.updateDocument(item);
    }

  }

  calculateDays(startDate: Date, endDate: Date): number {
    const date1 = new Date(this.datePipe.transform(new Date(startDate), 'yyyy-MM-dd'));
    const date2 = new Date(this.datePipe.transform(new Date(endDate), 'yyyy-MM-dd'));

    var diff = date2.getTime() - date1.getTime();
    return diff != 0 ? (Math.ceil(diff / (1000 * 3600 * 24))) : diff;
  }

  documentSelected(document: GenericDocument) {
    if (!this.selectedDocuments) {
      this.selectedDocuments = [];
    }

    let index = this.selectedDocuments.findIndex(
      (a) => a.id === document.id
    );
    if (index > -1) {
      this.selectedDocuments.splice(index, 1);
    } else {
      this.selectedDocuments.push(document);
    }
  }

  isSelected($event: any): boolean {
    return this.selectedDocuments && this.selectedDocuments?.length > 0 ? this.selectedDocuments.includes($event) : false;
  }
}


