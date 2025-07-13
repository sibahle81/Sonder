import { ViewChild, ElementRef, Output, EventEmitter, Input, Component, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PopupUploadDocumentComponent } from './popup-upload-document/popup-upload-document.component';
import { saveAs } from 'file-saver';
import { DocumentsRequest } from './documents-request';
import { WizardDetailBaseComponent } from '../wizard/views/wizard-detail-base/wizard-detail-base.component';
import { DocumentManagementService } from './document-management.service';
import { ValidationResult } from '../wizard/shared/models/validation-result';
import { Document } from './document';
import { PopupAdditionalRequirementComponent } from './popup-additional-requirement/popup-additional-requirement.component';
import { PopupOutstandingDocumentsComponent } from './popup-outstanding-documents/popup-outstanding-documents.component';
import { PopupDeleteDocumentComponent } from './popup-delete-document/popup-delete-document.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { DocumentSetEnum } from '../../enums/document-set.enum';
import { DocumentStatusEnum } from '../../enums/document-status.enum';
import { ServiceType } from '../../enums/service-type.enum';
import { UploadFile } from '../../models/upload-file.model';
import { AlertService } from '../../services/alert.service';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export abstract class DocumentManagementComponent<TModel> extends WizardDetailBaseComponent<TModel> {

  @Output() changeDocument = new EventEmitter();
  @Input() showAdditionalDocumentsButton: boolean;
  @Input() showOutstandingDocumentsButton: boolean;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  documents: Document[];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isData$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public dataSource = new MatTableDataSource<Document>();
  currentUser: string;
  documentsRequest: DocumentsRequest;
  uploadFile: UploadFile;
  menus: { title: string; url: string; disable: boolean }[];
  abstract documentSet: DocumentSetEnum;
  system: any;
  keys: any;
  id: any;
  hide = false;
  allDocumentsSupplied$ = new BehaviorSubject<boolean>(false);
  message = 'No Documents are Required';

  columnDefinitions: any[] = [
    { display: 'Document Type', def: 'documentTypeName', show: true },
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
    private dialog: MatDialog,
    private alertService: AlertService,
    public documentManagementService: DocumentManagementService
  ) {
    super(privateAppEventsManager, authService, activatedRoute);
  }

  abstract getDocumentKeys(): { [key: string]: string };

  abstract getSystemName(): string;

  createForm(id: number): void {

  }

  onLoadLookups(): void {
    this.isMatSort$.subscribe(result => {
      if (result) {
        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        })
      }
    })
  }

  populateModel(): void { }

  populateForm(): void {
    this.getInitialData();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  getDataValues() {
    this.loadData(this.documentsRequest, this.changeDocument);
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
      this.privateAppEventsManager.loadingStart('Uploading document');
      if (data) {
        this.getDataValues();
        this.privateAppEventsManager.loadingStop();
      } else { this.privateAppEventsManager.loadingStop(); }
    });
  }

  openDialogAdditionalDouments() {
    const dialogRef = this.dialog.open(PopupAdditionalRequirementComponent, {
      width: '1024px',
      data: { documentRequest: this.documentsRequest }
    });

    dialogRef.afterClosed().subscribe(data => {
      this.privateAppEventsManager.loadingStart('Requesting Additional documents');
      if (data) {
        this.documentManagementService.AddAdditionalDocuments(data).subscribe(a => {
          if (a === true) {
            this.getDataValues();
            this.privateAppEventsManager.loadingStop();
          }
        });
      } else {
        this.privateAppEventsManager.loadingStop();
      }
    });
  }

  openDialogDeleteDouments(row: Document) {
    const dialogRef = this.dialog.open(PopupDeleteDocumentComponent, {
      width: '1024px',
      data: { documentRequest: this.documentsRequest, keys: this.keys }
    });

    dialogRef.afterClosed().subscribe(data => {
      row.documentStatus = DocumentStatusEnum.Deleted;
      this.documentManagementService.UpdateDocument(row).subscribe(() => {
        this.getDataValues();
        this.privateAppEventsManager.loadingStop();
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
      this.privateAppEventsManager.loadingStart('Requesting Outstanding Documents');
      if (data) {
        this.documentManagementService.RequestOutstandingDocuments(data).subscribe(a => {
          if (a === true) {
            this.getDataValues();
            this.privateAppEventsManager.loadingStop();
          }
        });
      } else {
        this.privateAppEventsManager.loadingStop();
      }
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
    this.privateAppEventsManager.loadingStart('Updating document');
    row.documentStatus = DocumentStatusEnum.Accepted;
    this.documentManagementService.UpdateDocument(row).subscribe(() => {
      this.getDataValues();
      this.privateAppEventsManager.loadingStop();
    });
  }

  onDelete(row: Document) {
    if (this.system === ServiceType[ServiceType.ClaimManager]) {
      console.log('Delete with notes');
      this.openDialogDeleteDouments(row);
    } else {
      this.privateAppEventsManager.loadingStart('Deleting document');
      row.documentStatus = DocumentStatusEnum.Deleted;
      this.documentManagementService.UpdateDocument(row).subscribe(() => {
        this.getDataValues();
        this.privateAppEventsManager.loadingStop();
      });
    }
  }

  onWaive(row: Document) {
    this.privateAppEventsManager.loadingStart('Waiving document');
    row.documentStatus = DocumentStatusEnum.Waived;
    this.documentManagementService.UpdateDocument(row).subscribe(() => {
      this.getDataValues();
      this.privateAppEventsManager.loadingStop();
    });
  }

  getSelectedDataToView(row: Document) {
    this.documentManagementService.GetDocumentBinary(row.id).subscribe(document => {
      const documentDetails = document;
      this.openDialogViewDoument(documentDetails);
    });
  }

  openDialogViewDoument(documentDetails: any) {
    // const dialogRef = this.dialog.open(PopupViewDocumentComponent, {
    //   width: '1024px',
    //   data: { documentRequest: documentDetails }
    // });

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
    } else if (title === 'Upload Document') {
      // Passing the moduleId ("claimId etc") and systemName in as parameters
      this.openDialogUploadDocuments(item);
    }
  }

  filterMenu(item: any) {
    this.menus = null;
    if (!this.isDisabled) {
      switch (item.documentStatus) {
        case DocumentStatusEnum.Accepted:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false },
            { title: 'Accept', url: '', disable: true },
            { title: 'Waive', url: '', disable: true },
            { title: 'Delete', url: '', disable: false },
            { title: 'Upload Document', url: '', disable: true }
          ];
          break;
        case DocumentStatusEnum.Waived:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false },
            { title: 'Accept', url: '', disable: true },
            { title: 'Waive', url: '', disable: true },
            { title: 'Delete', url: '', disable: false },
            { title: 'Upload Document', url: '', disable: true }
          ];
          break;
        case DocumentStatusEnum.Deleted:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false },
            { title: 'Accept', url: '', disable: true },
            { title: 'Waive', url: '', disable: true },
            { title: 'Delete', url: '', disable: true },
            { title: 'Upload Document', url: '', disable: false }
          ];
          break;
        case DocumentStatusEnum.Received:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false },
            { title: 'Accept', url: '', disable: true },
            { title: 'Waive', url: '', disable: true },
            { title: 'Delete', url: '', disable: false },
            { title: 'Upload Document', url: '', disable: item.documentSet == DocumentSetEnum.MemberDocumentSet ? false : true }
          ];
          break;
        case DocumentStatusEnum.Awaiting:
          this.menus = [
            { title: 'Download', url: '', disable: true },
            { title: 'View', url: '', disable: true },
            { title: 'Accept', url: '', disable: true },
            { title: 'Waive', url: '', disable: true },
            { title: 'Delete', url: '', disable: true },
            { title: 'Upload Document', url: '', disable: false }
          ];
          break;
        default:
          this.menus = [
            { title: 'Download', url: '', disable: true },
            { title: 'View', url: '', disable: true },
            { title: 'Accept', url: '', disable: true },
            { title: 'Waive', url: '', disable: true },
            { title: 'Delete', url: '', disable: true },
            { title: 'Upload Document', url: '', disable: false }
          ];
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

  loadData(documentRequest: DocumentsRequest, eventEmitter: EventEmitter<any>) {
    this.isLoading$.next(true);
    this.documentManagementService.GetDocumentsBySetAndKey(documentRequest).subscribe(documents => {
      this.loadDocumentsEvent(documents, eventEmitter);
    });
  }

  loadDocumentsEvent(documents: Document[], eventEmitter: EventEmitter<any>) {
    this.documents = documents;
    this.documents.forEach(a => a.documentStatusText = DocumentStatusEnum[a.documentStatus]);
    this.dataSource.data = this.documents;
    this.isMatSort$.next(true);

    this.allDocumentsSupplied$.next(true);

    this.isLoading$.next(false);
    eventEmitter.emit();
  }
}
