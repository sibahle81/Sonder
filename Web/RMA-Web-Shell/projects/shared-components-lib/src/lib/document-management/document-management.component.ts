import { ViewChild, ElementRef, Output, EventEmitter, Input, Directive, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentManagementDataSource } from './document-management.datasource';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PopupUploadDocumentComponent } from './popup-upload-document/popup-upload-document.component';
import { UploadFile } from 'projects/shared-components-lib/src/lib/upload-control/upload-file.class';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { saveAs } from 'file-saver';
import { DocumentsRequest } from './documents-request';
import { WizardDetailBaseComponent } from '../wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DocumentManagementService } from './document-management.service';
import { ValidationResult } from '../wizard/shared/models/validation-result';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { Document } from './document';
import { PopupAdditionalRequirementComponent } from './popup-additional-requirement/popup-additional-requirement.component';
import { PopupOutstandingDocumentsComponent } from './popup-outstanding-documents/popup-outstanding-documents.component';
import { PopupDeleteDocumentComponent } from './popup-delete-document/popup-delete-document.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DocumentSetDocumentType } from 'projects/shared-models-lib/src/lib/common/document-set-document-type';
import { PopupRejectDocumentsComponent } from './popup-reject-documents/popup-reject-documents.component';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export abstract class DocumentManagementComponent<TModel> extends WizardDetailBaseComponent<TModel> {

  @Output() changeDocument = new EventEmitter();
  @Output() requiredDocumentsUploaded: EventEmitter<boolean> = new EventEmitter();

  @Input() showAdditionalDocumentsButton: boolean;
  @Input() showOutstandingDocumentsButton: boolean;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  dataSource: DocumentManagementDataSource;
  documentTypes: DocumentSetDocumentType[];
  currentUser: string;
  documentsRequest: DocumentsRequest;
  uploadFile: UploadFile;
  menus: { title: string; url: string; disable: boolean }[];
  abstract documentSet: DocumentSetEnum;
  system: any;
  keys: any;
  id: any;
  hide = false;
  message = 'No Documents are Required';
  documentAccepted: boolean;
  isRefreshing = new BehaviorSubject<number>(0);

  columnDefinitions: any[] = [
    { display: 'Document Name', def: 'documentName', show: true },
    { display: 'Document Decription', def: 'documentDescription', show: true },
    { display: 'Creator', def: 'createdBy', show: true },
    { display: 'Date Received', def: 'dateReceived', show: true },
    { display: 'Required', def: 'required', show: true },
    { display: 'Status', def: 'status', show: true },
    { display: 'Actions', def: 'actions', show: true },
    { display: 'IsReceive', def: 'isReceive', show: false }
  ];

  constructor(
    privateAppEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public alertService: AlertService,
    public documentManagementService: DocumentManagementService
  ) {
    super(privateAppEventsManager, authService, activatedRoute);
    this.dataSource = new DocumentManagementDataSource(privateAppEventsManager, alertService, documentManagementService);
  }

  get isLoading(): boolean {
    return this.dataSource.isLoading;
  }

  get isError(): boolean {
    return this.dataSource.isError;
  }

  abstract getDocumentKeys(): { [key: string]: string };

  abstract getSystemName(): string;

  createForm(id: number): void {
    this.dataSource.clearData();
  }

  onLoadLookups(): void { }

  populateModel(): void { }

  populateForm(): void {
    this.getInitialData();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  getDataValues() {
    this.documentManagementService.GetDocumentsTypesByDocumentSet(this.documentsRequest.documentSet).subscribe(results => {
      this.documentTypes = results;
      this.dataSource.loadData(this.documentsRequest, this.changeDocument);
      this.privateAppEventsManager.loadingStop();
    });
  }

  getDataValuesAndMarkRequireds(isRequired: boolean) {
    this.documentManagementService.GetDocumentsTypesByDocumentSet(this.documentsRequest.documentSet).subscribe(results => {
      this.documentTypes = results;
      this.documentTypes.forEach(document => {
        document.required = isRequired;
      });
      this.dataSource.loadData(this.documentsRequest, this.changeDocument);
    });
  }

  filterDocuments(documents: Document[], documentTypeId: number): Document[] {
    this.checkAllRequiredDocumentsUploaded();
    const documentsFiltered = documents.filter(a => a.docTypeId === documentTypeId && a.fileName);
    return documentsFiltered;
  }

  addMessage(message: string) {
    this.message = message;
  }

  getDisplayedColumns(): any[] {
    return this.columnDefinitions.filter(cd => cd.show).map(cd => cd.def);
  }

  openDialogUploadDocuments(item: any) {
    const dialogRef = this.dialog.open(PopupUploadDocumentComponent, {
      width: '1024px',
      data: { item, documentRequest: this.documentsRequest }
    });

    dialogRef.afterClosed().subscribe(data => {
      this.privateAppEventsManager.loadingStart('uploading...please wait');
      if (data) {
        this.getDataValues();
      } else { this.privateAppEventsManager.loadingStop(); }
    });
  }

  openDialogAdditionalDouments() {
    const dialogRef = this.dialog.open(PopupAdditionalRequirementComponent, {
      width: '1024px',
      data: { documentRequest: this.documentsRequest }
    });

    dialogRef.afterClosed().subscribe(data => {
      this.privateAppEventsManager.loadingStart('requesting...please wait');
      if (data) {
        this.documentManagementService.AddAdditionalDocuments(data).subscribe(a => {
          if (a === true) {
            this.getDataValues();
          }
        });
      } else {
        this.privateAppEventsManager.loadingStop();
      }
    });
  }

  openDialogDeleteDocuments(row: Document) {
    const dialogRef = this.dialog.open(PopupDeleteDocumentComponent, {
      width: '1024px',
      data: { documentRequest: this.documentsRequest, keys: this.keys }
    });

    dialogRef.afterClosed().subscribe(data => {
      row.documentStatus = DocumentStatusEnum.Deleted;
      this.documentManagementService.UpdateDocument(row).subscribe(() => {
        this.getDataValues();
      });
      this.getDataValues();
    });
  }

  openDialogOutstandingDouments() {
    const dialogRef = this.dialog.open(PopupOutstandingDocumentsComponent, {
      width: '1024px',
      data: { documentRequest: this.documentsRequest }
    });

    dialogRef.afterClosed().subscribe(data => {
      this.privateAppEventsManager.loadingStart('requesting...please wait');
      if (data) {
        this.documentManagementService.RequestOutstandingDocuments(data).subscribe(a => {
          if (a === true) {
            this.getDataValues();
          }
        });
      } else {
        this.privateAppEventsManager.loadingStop();
      }
    });
  }

  openDialogRejectDocuments(row: Document) {
    const dialogRef = this.dialog.open(PopupRejectDocumentsComponent, {
      width: '1024px',
      data: { documentRequest: this.documentsRequest }
    });
  }

  getInitialData() {
    if (this.model && this.documentSet > 0) {
      this.system = this.getSystemName();
      this.keys = this.getDocumentKeys();
      this.documentsRequest = new DocumentsRequest();
      this.documentsRequest.system = this.system;
      this.documentsRequest.keys = this.keys;
      this.documentsRequest.documentSet = this.documentSet;
      this.getDataValues();
    }
  }

  getSelectedData(row: Document) {
    this.documentManagementService
      .GetDocumentBinary(row.id)
      .subscribe(document => {
        const byteCharacters = atob(document.fileAsBase64);

        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const b: any = new Blob([byteArray], {
          type: document.mimeType
        });

        saveAs(b, document.fileName);
      });
  }

  onAccept(row: Document) {
    this.privateAppEventsManager.loadingStart('uploading...please wait');
    this.keys = this.getDocumentKeys();
    row.documentStatus = DocumentStatusEnum.Accepted;
    this.documentManagementService.UpdateDocument(row).subscribe(() => {
      this.documentManagementService.AutoReinstateMedicalInvoice(0, 0, Number(this.keys.PersonEvent)).subscribe(() => {
        this.getDataValues();
      });

    });
  }

  onDocumentAccept(row: Document) {
    this.privateAppEventsManager.loadingStart('uploading...please wait');
    this.keys = this.getDocumentKeys();
    row.documentStatus = DocumentStatusEnum.Accepted;
    this.documentManagementService.UpdateDocument(row).subscribe(() => {
        this.getDataValues();
    });
  }


  onRefresh(row: Document) {
    if (this.system === ServiceTypeEnum[ServiceTypeEnum.ClaimManager]) {
      this.openDialogDeleteDocuments(row);
    } else {
      this.privateAppEventsManager.loadingStart('refreshing...please wait');
      row.documentStatus = DocumentStatusEnum.Deleted;
      this.documentManagementService.UpdateDocument(row).subscribe(() => {
        window.location.reload();
      });
    }
  }

  onDelete(row: Document) {
    if (this.system === ServiceTypeEnum[ServiceTypeEnum.ClaimManager]) {
      this.openDialogDeleteDocuments(row);
    } else {
      this.privateAppEventsManager.loadingStart('deleting...please wait');
      row.documentStatus = DocumentStatusEnum.Deleted;
      this.documentManagementService.UpdateDocument(row).subscribe(() => {
        this.getDataValues();
      });
    }
  }

  onWaive(row: Document) {
    this.privateAppEventsManager.loadingStart('waiving...please wait');
    row.documentStatus = DocumentStatusEnum.Waived;
    this.documentManagementService.UpdateDocument(row).subscribe(() => {
      this.getDataValues();
    });
  }

  getSelectedDataToView(row: Document) {
    this.documentManagementService.GetDocumentBinary(row.id).subscribe(document => {
      const documentDetails = document;
      this.openDialogViewDoument(documentDetails);
    });
  }

  openDialogViewDoument(documentDetails: any) {
    this.getData(documentDetails);
  }

  getData(documentDetails: any) {
    const byteCharacters = atob(documentDetails.fileAsBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob: any = new Blob([byteArray], {
      type: documentDetails.mimeType
    });

    if (window.navigator && window.navigator.msSaveOrOpenBlob) { // IE
      window.navigator.msSaveOrOpenBlob(blob, documentDetails.fileName);
      // window.navigator.msSaveOrOpenBlob(blob, documentDetails.fileName);
    } else { // Chrome & Firefox
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      // link.download = documentDetails.fileName;
      window.open(URL.createObjectURL(blob));
    }
  }

  onMenuSelect(item: any, title: any) {
    if (title === 'Download') {
      this.getSelectedData(item);
    } else if (title === 'View') {
      this.getSelectedDataToView(item);
    } else if (title === 'Accept') {
      this.onAccept(item);
    } else if (title === 'Waive') {
      this.onWaive(item);
    } else if (title === 'Delete') {
      this.onDelete(item);
    } else if (title === 'Refresh') {
      this.onRefresh(item);
    }
  }

  filterMenu(item: any) {
    this.menus = null;
    if (!this.isDisabled) {
      if (item.docTypeId === DocumentTypeEnum.PremiumListing) {
        this.menus = [
          { title: 'Download', url: '', disable: false }
        ];
      } else if (item.docTypeId === DocumentTypeEnum.PolicySchedule
              || item.docTypeId === DocumentTypeEnum.GroupPolicySchedule
              || item.docTypeId === DocumentTypeEnum.WelcomeLetter
              || item.docTypeId === DocumentTypeEnum.PolicyOnboardingFile) {
        this.menus = [
          { title: 'Download', url: '', disable: false },
          { title: 'View', url: '', disable: false },
          { title: 'Delete', url: '', disable: false }
        ];
      }
      else {
        switch (item.documentStatus) {
          case DocumentStatusEnum.Accepted:
            this.menus = [
              { title: 'Download', url: '', disable: false },
              { title: 'View', url: '', disable: false },
              { title: 'Accept', url: '', disable: true },
              { title: 'Waive', url: '', disable: false },
              { title: 'Delete', url: '', disable: false },
            ];
            break;
          case DocumentStatusEnum.Waived:
            this.menus = [
              { title: 'Download', url: '', disable: false },
              { title: 'View', url: '', disable: false },
              { title: 'Accept', url: '', disable: true },
              { title: 'Waive', url: '', disable: true },
              { title: 'Delete', url: '', disable: false },
            ];
            break;
          case DocumentStatusEnum.Deleted:
            this.menus = [
              { title: 'Download', url: '', disable: false },
              { title: 'View', url: '', disable: false },
              { title: 'Accept', url: '', disable: false },
              { title: 'Waive', url: '', disable: false },
              { title: 'Delete', url: '', disable: true },
            ];
            break;
          case DocumentStatusEnum.Received:
            this.menus = [
              { title: 'Download', url: '', disable: false },
              { title: 'View', url: '', disable: false },
              { title: 'Accept', url: '', disable: false },
              { title: 'Waive', url: '', disable: false },
              { title: 'Delete', url: '', disable: false },
            ];
            break;
          case DocumentStatusEnum.Awaiting:
            this.menus = [
              { title: 'Download', url: '', disable: true },
              { title: 'View', url: '', disable: true },
              { title: 'Accept', url: '', disable: true },
              { title: 'Waive', url: '', disable: true },
              { title: 'Delete', url: '', disable: true },
            ];
            break;
          default:
            this.menus = [
              { title: 'Download', url: '', disable: true },
              { title: 'View', url: '', disable: true },
              { title: 'Accept', url: '', disable: true },
              { title: 'Waive', url: '', disable: false },
              { title: 'Delete', url: '', disable: true },
            ];
        }
      }
    } else {
      switch (item.documentStatus) {
        case DocumentStatusEnum.Accepted:
        case DocumentStatusEnum.Received:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false }
          ];
          break;
        default:
          this.menus = [
            // { title: 'Upload Document', url: '', disable: false }
          ];
      }
    }
  }

  checkAllDocumentsHaveBeenAccepted(): boolean {
    this.dataSource.data.forEach(a => {
      a.createdDate !== null && a.documentStatus === DocumentStatusEnum.Accepted ? this.documentAccepted = true : this.documentAccepted = false;
    });
    return this.documentAccepted;
  }

  checkIfDocumentTypeBeenAccepted(documentType: DocumentTypeEnum): Document {
    const document = this.dataSource.data.find(a =>
      a.createdDate !== null && a.documentStatus === DocumentStatusEnum.Accepted && a.docTypeId === documentType
    );
    return document;
  }

  checkIfDocumentTypeBeenUploaded(documentType: DocumentTypeEnum): Document {
    const document = this.dataSource.data.find(a =>
      a.createdDate !== null && (a.documentStatus === DocumentStatusEnum.Received || a.documentStatus === DocumentStatusEnum.Uploaded || a.documentStatus === DocumentStatusEnum.Accepted) && a.docTypeId === documentType
    );
    return document;
  }

  checkDocumentTypeCount(documentType: DocumentTypeEnum): Document[] {
    const documents = this.dataSource.data.filter(a =>
      a.createdDate !== null && (a.documentStatus === DocumentStatusEnum.Received || a.documentStatus === DocumentStatusEnum.Uploaded || a.documentStatus === DocumentStatusEnum.Accepted) && a.docTypeId === documentType
    );
    return documents;
  }

  checkAllRequiredDocumentsUploaded() {
    let allRequiredDocumentsReceived = this.dataSource.data ? true : false;
    // == must be used in anonomous types else the comparison will always fail
    // tslint:disable-next-line:triple-equals
    const requiredDocuments = this.dataSource.data.filter(a => a.required == true);

    requiredDocuments.forEach(document => {
      // == must be used in anonomous types else the comparison will always fail
      // tslint:disable-next-line:triple-equals
      if (document.documentStatus == DocumentStatusEnum.Awaiting) {
        allRequiredDocumentsReceived = false;
      }
    });

    this.requiredDocumentsUploaded.emit(allRequiredDocumentsReceived);
  }

  downloadTemplate(documentType: DocumentSetDocumentType) {
    if (!this.keys) { return; }
    if (!this.keys.PersonEvent) { return; }
    this.documentManagementService.GetDocumentTypeTemplateForPersonEvent(documentType.docTypeId, Number(this.keys.PersonEvent)).subscribe(documents => {
      for (const document of documents) {
        const byteCharacters = atob(document.attachmentByteData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const b: any = new Blob([byteArray], {
          type: document.fileType
        });
        saveAs(b, document.fileName);
      }
    });
  }

  canRefreshDocument(docTypeId: number) : boolean {
    return (docTypeId === DocumentTypeEnum.PolicySchedule
         || docTypeId === DocumentTypeEnum.GroupPolicySchedule
         || docTypeId === DocumentTypeEnum.WelcomeLetter
         || docTypeId === DocumentTypeEnum.TermsConditions
    );
  }

  openRefreshDocumentDialog(event: MouseEvent, documentType: DocumentSetDocumentType): void {
    // Prevent mat-panel from expanding
    event.stopPropagation();
    // Default implementation should be overridden in inherited classes that allow document refresh
    this.alertService.error(`${documentType.documentTypeName} cannot be refreshed`, 'Refresh Document');
  }
}
