import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { GenericDocument } from '../../models/generic-document';
import { saveAs } from 'file-saver';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { PolicyItemTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-item-type.enum';
import { UploadControlComponent } from '../../upload-control/upload-control.component';
import { Document } from '../../document-management/document';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { takeUntil } from 'rxjs/operators';
import { DocumentSystemNameEnum } from '../document-system-name-enum';
import { DocumentSetDialogComponent } from './document-set-dialog/document-set-dialog.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { DatePipe } from '@angular/common';
import { DocumentType } from 'projects/shared-models-lib/src/lib/common/document-type';
import { ToastrManager } from 'ng6-toastr-notifications';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent extends UnSubscribe implements OnChanges {

  @Input() systemName: DocumentSystemNameEnum;
  @Input() keyName: string;
  @Input() keyValue: string;
  @Input() documentSetFilter: DocumentSetEnum[];

  @Input() expiryDate: Date; // optional: override the date used to calculate number of days to expiry documentType.validDays must be set to -1
  @Input() isReadOnly = false; // optional: force readonly
  @Input() enableMultiSelect = false;// optional: enable user to select multiple document that will be emitted and can be used on the parent component

  @Output() selectedDocumentsEmit: EventEmitter<GenericDocument[]> = new EventEmitter();

  @ViewChild('uploadDocuments', { static: false }) uploadControlComponent: UploadControlComponent;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isUploading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  currentQuery: any;

  documentSets: DocumentSetEnum[];
  documentTypes: DocumentTypeEnum[];
  expiredDocumentTypes: DocumentType[] = [];
  allDocuments: GenericDocument[];
  documents$: Observable<GenericDocument[]>;

  selectedDocumentSet: DocumentSetEnum;
  selectedDocumentType: DocumentTypeEnum;

  showUploader: boolean;

  documentDescription = '';

  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  documentTypesObj: DocumentType[];

  supportedDocumentTypes: string[] = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];

  selectedDocuments: GenericDocument[] = [];

  currentUser: User;

  constructor(
    private readonly documentManagementService: DocumentManagementService,
    private readonly datePipe: DatePipe,
    public dialog: MatDialog,
    private readonly alert: ToastrManager,
    private readonly authService: AuthService
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
    if (this.keyName && this.keyValue && this.systemName) {
      this.isLoading$.next(true);
      this.reset();
      this.getData();
    }
  }

  refresh() {
    this.isLoading$.next(true);
    this.selectedDocuments = [];
    this.reset();
    this.getData();
  }

  reset() {
    this.allDocuments = null;
    this.documentSets = null;
    this.documentTypes = null;
    this.documents$ = null;
    this.showUploader = false;
  }

  getData() {
    this.documentManagementService.getDocumentsByKey(this.keyName, this.keyValue).pipe(takeUntil(this.unSubscribe$)).subscribe(documents => {
      this.allDocuments = this.filterOnSystemName(documents);
      this.allDocuments = this.filterOnDocumentSets(this.allDocuments);
      this.allDocuments = this.filterOnMemberVisibility(this.allDocuments);
      this.getUniqueDocumentSets(this.allDocuments);
      this.isLoading$.next(false);
    });
  }

  filterOnSystemName(documents: GenericDocument[]): GenericDocument[] {
    return documents.filter(s => s.systemName === DocumentSystemNameEnum[this.systemName]);
  }

  filterOnDocumentSets(documents: GenericDocument[]): GenericDocument[] {
    if (!this.documentSetFilter || this.documentSetFilter?.length <= 0) { return documents }
    return documents.filter(s => this.documentSetFilter.includes(s.documentSet));
  }

  filterOnMemberVisibility(documents: GenericDocument[]): GenericDocument[] {
    if (this.currentUser.isInternalUser) {
      return documents;
    } else {
      return documents.filter(s => s.isMemberVisible);
    }
  }

  getUniqueDocumentSets(documents: GenericDocument[]) {
    this.documentSets = [...new Set(documents.map((item) => item.documentSet))];
  }

  getUniqueDocumentTypes(documentSet: DocumentSetEnum) {
    this.isLoading$.next(true);
    this.selectedDocumentSet = documentSet;
    this.documentTypes = null;
    const documents = this.allDocuments.filter(s => s.documentSet === documentSet);

    // get document types that have uploaded documents
    this.documentTypes = [...new Set(documents.map((item) => item.documentType))];

    // get document types with zero documents
    this.documentManagementService.GetDocumentTypesBySetId(this.selectedDocumentSet).subscribe(results => {
      this.documentTypesObj = results;

      if (results && results?.length > 0) {
        results.forEach(s => {
          if (!this.documentTypes.includes(s.id)) {
            this.documentTypes.push(s.id);
          }
          this.isExpired(s.id);
        });
      }
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

  getDocumentCount(documentType: DocumentTypeEnum): number {
    const documents = this.allDocuments.filter(s => s.documentType === documentType && s.documentSet === this.selectedDocumentSet);
    return documents?.length;
  }

  getDocumentSet(documentSet: DocumentSetEnum): string {
    return this.formatText(DocumentSetEnum[documentSet]);
  }

  getDocumentType(documentType: DocumentTypeEnum): string {
    return this.formatText(DocumentTypeEnum[documentType]);
  }

  formatText(text: string): string { // 
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
    this.showUploader = this.isReadOnly ? false : !this.showUploader;
  }

  save(documentType: DocumentTypeEnum) {
    this.isUploading$.next(true);
    const uploadedFiles = this.uploadControlComponent.getUploadedFiles();

    for (const file of uploadedFiles) {
      const document = new Document();

      document.docTypeId = documentType;
      document.fileExtension = file.file.type;
      document.fileName = file.name;
      document.keys = this.getKeys();
      document.documentStatus = DocumentStatusEnum.Received;
      document.documentSet = DocumentSetEnum[this.selectedDocumentSet];
      document.isMemberVisible = !this.currentUser.isInternalUser;
      document.documentDescription = this.documentDescription;
      document.systemName = DocumentSystemNameEnum[this.systemName];

      const reader = new FileReader();
      reader.onload = () => {
        document.fileAsBase64 = reader.result.toString();
        this.documentManagementService.UploadDocument(document).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {

          const newDoc = new GenericDocument();
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

      reader.readAsDataURL(file.file);
    }
  }

  downloadDocument(genericDocument: GenericDocument) {
    this.documentManagementService.GetDocumentBinary(genericDocument.id).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
      const byteCharacters = atob(result.fileAsBase64);

      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters?.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const b: any = new Blob([byteArray], {
        type: result.mimeType
      });

      saveAs(b, genericDocument.fileName);
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

  calculateDays(startDate: Date, endDate: Date): number {
    const date1 = new Date(this.datePipe.transform(new Date(startDate).getCorrectUCTDate(), 'yyyy-MM-dd'));
    const date2 = new Date(this.datePipe.transform(new Date(endDate).getCorrectUCTDate(), 'yyyy-MM-dd'));

    var diff = date2.getTime() - date1.getTime();
    return diff != 0 ? (Math.ceil(diff / (1000 * 3600 * 24))) : diff;
  }

  openDocumentSetDialog() {
    const dialogRef = this.dialog.open(DocumentSetDialogComponent, {
      width: '40%',
      data: {
        existingDocumentSets: this.documentSets
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.forEach(element => {
          this.documentSets.push(+[DocumentSetEnum[element]]);
        });
      }
    });
  }

  openAuditDialog(document: GenericDocument) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.PolicyManager,
        clientItemType: PolicyItemTypeEnum.PolicyDocument,
        itemId: document.id,
        heading: 'Document Audit',
        propertiesToDisplay: ['FileName', 'DocumentDescription', 'DocTypeId', 'FileExtension', 'DocumentStatus', 'SystemName', 'VerifiedBy', 'VerifiedByDate']
      }
    });
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
      this.documentManagementService.GetDocumentBinary(document.id).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
        document.fileAsBase64 = result.fileAsBase64;
        this.selectedDocuments.push(document);
      });
    }
  }

  isSelected($event: any): boolean {
    return this.selectedDocuments && this.selectedDocuments?.length > 0 ? this.selectedDocuments.includes($event) : false;
  }

  emitSelectedDocuments() {
    this.selectedDocumentsEmit.emit(this.selectedDocuments);
    this.refresh();
  }

  setMemberVisible(document: GenericDocument) {
    document.isMemberVisible = !document.isMemberVisible;
    this.updateDocument(document);
  }

  updateDocument(document: GenericDocument) {
    const doc = new Document();
    doc.id = document.id;
    doc.documentStatus = document.documentStatus;
    doc.isMemberVisible = document.isMemberVisible;

    this.documentManagementService.UpdateDocument(doc).subscribe(result => {
      this.alert.successToastr('member visibility updated successfully...');
    });
  }
}
