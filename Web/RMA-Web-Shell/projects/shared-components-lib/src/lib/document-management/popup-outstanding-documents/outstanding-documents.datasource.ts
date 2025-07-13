import { Injectable, EventEmitter } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { Document } from '../document';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DocumentManagementService } from '../document-management.service';
import { DocumentsRequest } from '../documents-request';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';

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
