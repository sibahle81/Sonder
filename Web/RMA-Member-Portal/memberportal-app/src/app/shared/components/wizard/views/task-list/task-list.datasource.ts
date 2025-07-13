import { Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { Datasource } from 'src/app/shared-utilities/datasource/datasource';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Wizard } from '../../shared/models/wizard';
import { WizardService } from '../../shared/services/wizard.service';

@Injectable()
export class TaskListDataSource extends Datasource {

  constructor(
    alertService: AlertService,
    appEventsManager: AppEventsManager,
    private readonly wizardService: WizardService
  ) {
    super(appEventsManager, alertService);
    this.defaultSortColumn = 'name';
  }

  getData() {
    this.startLoading('Loading user wizards...');
    this.wizardService.getUserWizards(null, false).subscribe(
      data => {
        this.dataChange.next(data);
        this.stopLoading();
      }
    );
  }

  connect(): Observable<Wizard[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];
    return merge(...displayDataChanges).pipe(map(() => {
      this.filteredData = this.data.slice().filter((item: Wizard) => {
        const searchStr = (`${item.name}`).toLowerCase();
        return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
      });
      const sortedData = this.getSortedData(this.filteredData.slice());
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
      return this.renderedData;
    }));
  }
}
