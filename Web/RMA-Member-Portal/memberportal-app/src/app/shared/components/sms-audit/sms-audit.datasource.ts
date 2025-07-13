import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { Datasource } from 'src/app/shared-utilities/datasource/datasource';
import { SmsAudit } from '../../models/sms-audit.model';
import { AlertService } from '../../services/alert.service';
import { SmsAuditService } from '../../services/sms-audit.service';

@Injectable({
  providedIn: 'root'
})
export class SmsAuditComponentDataSource extends Datasource {
  filteredData: SmsAudit[] = [];

  constructor(
    alertService: AlertService,
    appEventsManagerService: AppEventsManager,
    private readonly service: SmsAuditService) {
    super(appEventsManagerService, alertService);
    this.isLoading = false;
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  getData(query: any): void {
    this.isLoading = true;
    if (query.itemType === 'Claim' || query.itemType === 'PersonEvent') {
      this.service.GetClaimSmsAudit(query.itemType, query.itemId).subscribe(smsAudits => {
        if (smsAudits.length > 0) {
          this.filteredData = smsAudits;
          this.dataChange.next(this.filteredData);
        }
        this.stopLoading();
        this.isLoading = false;
      });
    } else {
      this.service.GetSmsAudit(query.itemType, query.itemId).subscribe(smsAudits => {
        if (smsAudits.length > 0) {
          this.filteredData = smsAudits;
          this.dataChange.next(this.filteredData);
        }
        this.stopLoading();
        this.isLoading = false;
      });
    }
  }

  connect(): Observable<SmsAudit[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      this.filteredData = this.data.slice().filter((item: SmsAudit) => {
      });

      const sortedData = this.getSortedData(this.filteredData.slice());

      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
      return this.renderedData;
    }
    ));
  }
}
