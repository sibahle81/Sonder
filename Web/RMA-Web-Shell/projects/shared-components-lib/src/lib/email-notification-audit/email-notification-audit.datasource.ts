import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { EmailAudit } from 'projects/shared-models-lib/src/lib/common/emailAudit';
import { EmailNotificationAuditService } from './email-notification-audit.service';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class EmailNotificationAuditComponentDataSource extends Datasource {
  filteredData: EmailAudit[] = [];

  constructor(
    alertService: AlertService,
    appEventsManagerService: AppEventsManager,
    private readonly datePipe: DatePipe,
    private readonly service: EmailNotificationAuditService) {
    super(appEventsManagerService, alertService);
    this.isLoading = false;
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  getData(query: any): void {
    this.isLoading = true;
    this.paginator.pageIndex = 0;
    if (query.itemType === 'Claim') {
      this.service.getClaimEmailAudit(query.itemType, query.itemId).subscribe(smsAudits => {
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

  getDataByDate(query: any): void {
    this.isLoading = true;
    this.paginator.pageIndex = 0;
      this.service.GetEmailAuditByDate(query.itemType, query.startDate).subscribe(smsAudits => {
        if (smsAudits.length > 0) {
          this.filteredData = smsAudits;
          this.dataChange.next(this.filteredData);
        }
        this.stopLoading();
        this.isLoading = false;
      });
  }

  getEmailAuitAndAttachmentData(auditId : number) : Observable<EmailAudit>{
    return this.service.GetEmailAuditAndAttachment(auditId)
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
