import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { TemplateService } from 'projects/admin/src/app/campaign-manager/shared/services/template-service';
import { Template } from 'projects/admin/src/app/campaign-manager/shared/entities/template';
import { map } from 'rxjs/operators';

@Injectable()
export class TemplateSearchDataSource extends Datasource {

  constructor(
    private readonly appEventsManager: AppEventsManager,
    private readonly alertService: AlertService,
    private readonly templateService: TemplateService
  ) {
    super(appEventsManager, alertService);
    this.isLoading = false;
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  getData(query: string): void {
    this.isLoading = true;
    this.templateService.searchTemplates('Email', query).subscribe(
      templates => {
        this.templateService.searchTemplates('Sms', query).subscribe(
          smsTemplates => {
            templates = templates.concat(smsTemplates);
            this.dataChange.next(templates);
            this.isLoading = false;
          }
        )
      }
    );
  }

  connect(): Observable<Template[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      this.filteredData = this.data.slice().filter((item: Template) => {
        const searchStr = item.name.toLowerCase();
        return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
      });

      const sortedData = this.getSortedData(this.filteredData.slice());
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
      return this.renderedData;
    }));
  }
}
