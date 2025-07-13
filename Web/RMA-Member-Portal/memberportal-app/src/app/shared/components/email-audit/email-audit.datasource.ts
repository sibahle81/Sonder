import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { Datasource } from 'src/app/shared-utilities/datasource/datasource';
import { EmailAudit } from '../../models/email-audit.model';
import { AlertService } from '../../services/alert.service';
import { EmailAuditService } from '../../services/email-audit.service';

@Injectable({
  providedIn: 'root'
})
export class EmailNotificationAuditComponentDataSource extends Datasource {
  filteredData: EmailAudit[] = [];

  constructor(
    alertService: AlertService,
    appEventsManagerService: AppEventsManager,
    private readonly datePipe: DatePipe,
    private readonly service: EmailAuditService) {
    super(appEventsManagerService, alertService);
    this.isLoading = false;
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  getData(query: any): void {
    this.isLoading = true;
    this.paginator.pageIndex = 0;
    if (query.itemType === 'Claim' || query.itemType === 'PersonEvent') {
      this.service.GetClaimNotificationAudit(query.itemType, query.itemId).subscribe(smsAudits => {
        if (smsAudits.length > 0) {
          this.filteredData = smsAudits;
          this.dataChange.next(this.filteredData);
        }
        this.stopLoading();
        this.isLoading = false;
      });
    } else {
      this.service.GetEmailAudit(query.itemType, query.itemId).subscribe(smsAudits => {
        if (smsAudits.length > 0) {
          this.filteredData = smsAudits;
          this.dataChange.next(this.filteredData);
        }
        this.stopLoading();
        this.isLoading = false;
      });
    }
  }

  connect(): Observable<EmailAudit[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      this.filteredData = this.data.slice().filter((item: EmailAudit) => {
        if (item.fromAddress == null) {
          const searchStr = (item.reciepients).toLowerCase() + this.datePipe.transform(item.createdDate, 'dd-MM-yyyy');
          return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
        } else {
          let searchStr;
          if (item.reciepients != null) {
            searchStr = (item.reciepients).toLowerCase() + (item.fromAddress).toLowerCase() + this.datePipe.transform(item.createdDate, 'dd-MM-yyyy');
          } else {
            searchStr = (item.fromAddress).toLowerCase() + this.datePipe.transform(item.createdDate, 'dd-MM-yyyy');
          }

          return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
        }
      });

      const sortedData = this.getSortedData(this.filteredData.slice());

      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
      return this.renderedData;
    }
    ));
  }
}
