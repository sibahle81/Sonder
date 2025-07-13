import { Injectable, EventEmitter } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { Datasource } from 'src/app/shared-utilities/datasource/datasource';
import { DocumentStatusEnum } from 'src/app/shared/enums/document-status.enum';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Document } from '../document';
import { DocumentManagementService } from '../document-management.service';
import { DocumentsRequest } from '../documents-request';

@Injectable({
  providedIn: 'root'
})
export class OutstandingDocumentsDatasource extends Datasource {

  documents: Document[];
  isLoading = true;

  constructor(
    appEventsManager: AppEventsManager,
    alertService: AlertService,
    private documentService: DocumentManagementService
  ) {
    super(appEventsManager, alertService);
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  loadData(documentRequest: DocumentsRequest) {
    this.isLoading = true;
    this.documentService.OutstandingDocuments(documentRequest).subscribe(documents => {
      this.loadDocumentsEvent(documents);
    });
  }

  getData(documentRequest: DocumentsRequest): void {
    this.isLoading = true;
    this.documentService.GetDocumentsBySetAndKey(documentRequest).subscribe(documents => {
      this.loadDocuments(documents);
    });
  }

  loadDocuments(documents: Document[]) {
    this.documents = documents;
    this.documents.forEach(a => a.documentStatusText = DocumentStatusEnum[a.documentStatus]);
    this.dataChange.next([...this.documents]);
    this.isLoading = false;
    this.stopLoading();
  }

  loadDocumentsEvent(documents: Document[]) {
    this.documents = documents;
    this.documents.forEach(a => a.documentStatusText = DocumentStatusEnum[a.documentStatus]);
    this.dataChange.next([...this.documents]);
    this.isLoading = false;
    this.stopLoading();
  }

  connect(): Observable<Document[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.data.slice().filter((item: Document) => {
          const searchStr = '';
          return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
        });

        const sortedData = this.getSortedData(this.filteredData.slice());
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
        return this.renderedData;
      })
    );
  }
}
