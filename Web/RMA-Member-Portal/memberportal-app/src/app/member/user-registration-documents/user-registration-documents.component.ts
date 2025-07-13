import { Component, Input, OnInit, Output } from '@angular/core';
import { DocumentSetEnum } from 'src/app/shared/enums/document-set.enum';
import { DocumentStatusEnum } from 'src/app/shared/enums/document-status.enum';
import { ServiceType } from 'src/app/shared/enums/service-type.enum';
import { DocumentsRequest } from 'src/app/shared/models/documents-request.model';
import { Document } from '../../shared/models/document.model';
import { UserRegistrationService } from '../services/user-registration.service';
import { MatDialog } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { UserRegistrationPopupUploadDocumentComponent } from './user-registration-popup-upload-document/user-registration-popup-upload-document.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


@Component({
  selector: 'app-user-registration-documents',
  templateUrl: './user-registration-documents.component.html',
  styleUrls: ['./user-registration-documents.component.scss']
})

export class UserRegistrationDocumentsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Output() documentUploaded: boolean;
  displayedColumns: string[] = ['documentTypeName', 'dateReceived', 'isReceived', 'required', 'status', 'actions'];
  public dataSource = new  MatTableDataSource<Document>();
  private documentRequest = new DocumentsRequest();
  public menus: { title: string; url: string; disable: boolean }[];
  @Input() userRegistrationIdnumber: string;
  @Input() documentSet: DocumentSetEnum;
  public isLoading = false;

  constructor(
    private userRegistrationService: UserRegistrationService,
    private dialog: MatDialog,
    private alertService: AlertService
    ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getDocuments();
  }

  getDocumentKeys(): { [key: string]: string } {
    return { UserMember: this.userRegistrationIdnumber };
  }

  getSystemName(): string {
    return ServiceType[ServiceType.ClaimManager];
  }

  getDocuments() {
    if (!this.documentSet){
      this.documentSet = DocumentSetEnum.UserRegistrationPassportDocuments;
    }
    this.documentRequest.system = this.getSystemName();
    this.documentRequest.keys = this.getDocumentKeys();
    this.documentRequest.documentSet = this.documentSet;
    this.userRegistrationService.GetDocumentsBySetAndKey(this.documentRequest).subscribe((documents) => {
      this.dataSource.data = documents;
      this.dataSource.data.forEach(a => a.documentStatusText = DocumentStatusEnum[a.documentStatus]);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.isLoading = false;
    });
  }


  openDialogUploadDocuments(item: any) {
    const dialogRef = this.dialog.open(UserRegistrationPopupUploadDocumentComponent, {
      width: '1024px',
      data: { item, documentRequest: this.documentRequest }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.getDocuments();
      } else {  }
    });
  }

  getSelectedData(row: Document) {
    this.userRegistrationService
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

  onDelete(row: Document){
    row.documentStatus = DocumentStatusEnum.Deleted;
    this.userRegistrationService.UpdateDocument(row).subscribe(() => {
        this.alertService.success('Document Removed Succesfully');
        this.getDocuments();
      }, (error) => {
        this.alertService.error(error);
      });
  }

  getSelectedDataToView(row: Document) {
    this.userRegistrationService.GetDocumentBinary(row.id).subscribe(document => {
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
    } else { // Chrome & Firefox
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      window.open(URL.createObjectURL(blob));
    }
  }


  onMenuSelect(item: any, title: any) {
    if (title === 'Download') {
      this.getSelectedData(item);
    } else if (title === 'View') {
      this.getSelectedDataToView(item);
    } else if (title === 'Delete') {
      this.onDelete(item);
    } else if (title === 'Upload Document') {
      this.openDialogUploadDocuments(item);
    }
  }

  filterMenu(item: any) {
    this.menus = null;
    switch (item.documentStatus) {
        case DocumentStatusEnum.Accepted:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false },
            { title: 'Delete', url: '', disable: false },
            { title: 'Upload Document', url: '', disable: true }
          ];
          break;
        case DocumentStatusEnum.Waived:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false },
            { title: 'Delete', url: '', disable: false },
            { title: 'Upload Document', url: '', disable: true }
          ];
          break;
        case DocumentStatusEnum.Deleted:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false },
            { title: 'Delete', url: '', disable: true },
            { title: 'Upload Document', url: '', disable: false }
          ];
          break;
        case DocumentStatusEnum.Received:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false },
            { title: 'Delete', url: '', disable: false },
            { title: 'Upload Document', url: '', disable: true }
          ];
          break;
        case DocumentStatusEnum.Awaiting:
          this.menus = [
            { title: 'Download', url: '', disable: true },
            { title: 'View', url: '', disable: true },
            { title: 'Delete', url: '', disable: true },
            { title: 'Upload Document', url: '', disable: false }
          ];
          break;
        default:
          this.menus = [
            { title: 'Download', url: '', disable: true },
            { title: 'View', url: '', disable: true },
            { title: 'Delete', url: '', disable: true },
            { title: 'Upload Document', url: '', disable: false }
          ];
    }
  }

  checkAllDocumentsUpload(): boolean{
    this.dataSource.data.forEach(a => {
      a.createdDate !== null && a.required ? this.documentUploaded = true : this.documentUploaded = false;
    });
    return this.documentUploaded;
  }
}
