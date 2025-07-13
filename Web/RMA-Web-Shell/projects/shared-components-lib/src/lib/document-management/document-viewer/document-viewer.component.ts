import { Component, Input, OnInit } from '@angular/core';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DocumentManagementService } from '../document-management.service';
import { Document } from '../document';
import { BehaviorSubject } from 'rxjs';
import { saveAs } from 'file-saver';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';

@Component({
  selector: 'document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css']
})
export class DocumentViewerComponent implements OnInit {

  @Input() documentId: number;

  public documents = [];
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public menus: { title: string; url: string; disable: boolean }[];

  public columnDefinitions: any[] = [
    { display: 'Document Name', def: 'documentName', show: true },
    { display: 'Document Decription', def: 'documentDescription', show: true },
    { display: 'Creator', def: 'createdBy', show: true },
    { display: 'Date Received', def: 'dateReceived', show: true },
    { display: 'Status', def: 'status', show: true },
    { display: 'Actions', def: 'actions', show: true },
  ];

  constructor(
    public alertService: AlertService,
    public documentManagementService: DocumentManagementService) { }

  ngOnInit(): void {
    if (this.documentId) {
      this.isLoading$.next(true);
      this.documentManagementService.GetDocumentById(this.documentId).subscribe( (result) => {
        if (result) {
          this.documents.push(result);
        }
        this.isLoading$.next(false);
      });
    }
  }

  getDisplayedColumns(): any[] {
    return this.columnDefinitions.filter(cd => cd.show).map(cd => cd.def);
  }

  filterMenu(item: any) {
    this.menus = null;

    this.menus = [
      { title: 'Download', url: '', disable: false },
      { title: 'View', url: '', disable: false },
    ];
  }

  onMenuSelect(item: any, title: any) {
    if (title === 'Download') {
      this.download(item);
    } else if (title === 'View') {
      this.view(item);
    }
  }

  view(document: Document) {
    this.getSelectedDataToView(document);
  }

  download(document: Document) {
    this.getSelectedData(document);
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

  getSelectedDataToView(row: Document) {
    this.documentManagementService.GetDocumentBinary(row.id).subscribe(document => {
      const documentDetails = document;
      this.getData(documentDetails);
    });
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

  getDocumentStatus(id: number) {
    return this.format(DocumentStatusEnum[id]);
  }

  format(text: string) {
    if (text.length > 0) {
      const status = text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim();
      return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
    }
  }

}
